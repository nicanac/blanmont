#!/usr/bin/env python3
"""Antigravity PreToolUse Security and Safety Guards.

Ports the Claude Code guard suite to Antigravity's lifecycle hooks:
- guard-secrets: Blocks reading, viewing, or leaking secret files (.env, credentials, etc.)
- guard-key-literals: Blocks live credentials, API keys, tokens from being written or executed
- guard-protected-push: Blocks direct or force pushes to main, master, or protected branches
- guard-delete-outside: Blocks rm/unlink/git clean outside the repository
- guard-worktree-path: Restricts git worktrees to the allowed worktrees directory
"""
import importlib
import json
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))
CLAUDE_HOOKS_DIR = os.path.join(REPO_ROOT, ".claude", "hooks")
SESSION_FILE = os.path.join(SCRIPT_DIR, ".session_edits.json")

if CLAUDE_HOOKS_DIR not in sys.path:
    sys.path.insert(0, CLAUDE_HOOKS_DIR)

def load_module(name):
    try:
        return importlib.import_module(name)
    except Exception:
        return None

sec = load_module("guard-secrets")
lit = load_module("guard-key-literals")
push = load_module("guard-protected-push")
dele = load_module("guard-delete-outside")
wt = load_module("guard-worktree-path")

def format_key_reason(hits):
    return (
        "Possible live credential in this change, at line(s) %s. Do not print or repeat the value. "
        "Move it to the local dotenv file, read it from the environment at the call site, and add only "
        "the key NAME to the checked-in example env file. If this is a placeholder or test fixture, make "
        "it obviously fake (prefix it with YOUR_ or example_) and retry. Checked by guard-key-literals."
        % ",".join(map(str, hits))
    )

def record_touched_file(file_path):
    try:
        data = []
        if os.path.exists(SESSION_FILE):
            try:
                with open(SESSION_FILE, "r", encoding="utf-8") as fh:
                    data = json.load(fh)
            except Exception:
                data = []
        if file_path not in data:
            data.append(file_path)
        with open(SESSION_FILE, "w", encoding="utf-8") as fh:
            json.dump(data, fh)
    except Exception:
        pass

def main():
    try:
        raw_input = sys.stdin.read() or "{}"
        payload = json.loads(raw_input)
    except Exception:
        print(json.dumps({"decision": "allow"}))
        return

    tool_call = payload.get("toolCall") or {}
    tool_name = tool_call.get("name") or ""
    args = tool_call.get("args") or {}

    workspaces = payload.get("workspacePaths") or []
    project_dir = workspaces[0] if workspaces else REPO_ROOT
    cwd = args.get("Cwd") or project_dir
    os.environ["CLAUDE_PROJECT_DIR"] = project_dir

    # 1. Guard Secrets
    if sec:
        try:
            if tool_name == "run_command":
                cmd = args.get("CommandLine") or ""
                if not sec.ENV_CHECK.match(cmd) and sec.SECRET_RE.search(cmd):
                    print(json.dumps({"decision": "deny", "reason": sec.REASON}))
                    return
            elif tool_name == "view_file":
                path = args.get("AbsolutePath") or ""
                if sec.SECRET_RE.search(path):
                    print(json.dumps({"decision": "deny", "reason": sec.REASON}))
                    return
            elif tool_name in ("write_to_file", "replace_file_content"):
                path = args.get("TargetFile") or ""
                if sec.SECRET_RE.search(path):
                    print(json.dumps({"decision": "deny", "reason": sec.REASON}))
                    return
        except Exception:
            pass

    # 2. Guard Key Literals
    if lit:
        try:
            if tool_name == "run_command":
                cmd = args.get("CommandLine") or ""
                hits = lit.hit_lines(cmd)
                if hits:
                    print(json.dumps({"decision": "deny", "reason": format_key_reason(hits)}))
                    return
            elif tool_name in ("write_to_file", "replace_file_content"):
                path = args.get("TargetFile") or ""
                if not any(path.endswith(t) for t in lit.TEMPLATE_FILES):
                    content = args.get("CodeContent") or args.get("ReplacementContent") or ""
                    hits = lit.hit_lines(content)
                    if hits:
                        print(json.dumps({"decision": "deny", "reason": format_key_reason(hits)}))
                        return
        except Exception:
            pass

    # 3. Guard Protected Push
    if push and tool_name == "run_command":
        try:
            if os.environ.get("SB_ALLOW_PROTECTED_PUSH") != "1":
                cmd = args.get("CommandLine") or ""
                branches = push.protected_branches(project_dir)
                reason = push.check(cmd, cwd, branches, push.current_branch)
                if reason:
                    print(json.dumps({"decision": "deny", "reason": reason}))
                    return
        except Exception:
            pass

    # 4. Guard Delete Outside
    if dele and tool_name == "run_command":
        try:
            cmd = args.get("CommandLine") or ""
            reason = dele.check(cmd, cwd, project_dir, dict(os.environ))
            if reason:
                print(json.dumps({"decision": "deny", "reason": reason}))
                return
        except Exception:
            pass

    # 5. Guard Worktree Path
    if wt and tool_name == "run_command":
        try:
            cmd = args.get("CommandLine") or ""
            def root_of(d):
                top = wt.toplevel_of(d) or (project_dir if d == cwd else None)
                return wt.repo_root(top) if top else None
            reason = wt.check(cmd, cwd, root_of, dict(os.environ))
            if reason:
                print(json.dumps({"decision": "deny", "reason": reason}))
                return
        except Exception:
            pass

    # If it's a file write, record touched file for Impeccable review
    if tool_name in ("write_to_file", "replace_file_content"):
        target_file = args.get("TargetFile") or ""
        if target_file:
            record_touched_file(target_file)

    print(json.dumps({"decision": "allow"}))

if __name__ == "__main__":
    main()
