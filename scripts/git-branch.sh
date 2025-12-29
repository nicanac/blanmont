#!/bin/bash

# Usage: ./scripts/git-branch.sh <type> <name>
# Example: ./scripts/git-branch.sh feature authentication-flow

VALID_TYPES=("feature" "feat" "fix" "bugfix" "chore" "docs" "refactor" "style" "test" "perf" "ci" "build" "revert")

function show_help {
  echo "Sidereal Satellite Branch Helper"
  echo "--------------------------------"
  echo "Usage: npm run branch <type> <name>"
  echo ""
  echo "Arguments:"
  echo "  <type>   The type of change. Must be one of standard commit types."
  echo "  <name>   The name of the branch (kebab-case recommended)."
  echo ""
  echo "Valid Types:"
  echo "  - feature, feat    New feature"
  echo "  - fix, bugfix      Bug fix"
  echo "  - chore            Maintenance, dependencies, tooling"
  echo "  - docs             Documentation only changes"
  echo "  - refactor         Code change that neither fixes a bug nor adds a feature"
  echo "  - style            Changes that do not affect the meaning of the code (white-space, formatting, etc)"
  echo "  - test             Adding missing tests or correcting existing tests"
  echo "  - perf             A code change that improves performance"
  echo "  - ci               Changes to our CI configuration files and scripts"
  echo "  - build            Changes that affect the build system or external dependencies"
  echo "  - revert           Reverts a previous commit"
  echo ""
  echo "Examples:"
  echo "  npm run branch feature user-profile"
  echo "  npm run branch fix login-error"
  echo "  npm run branch docs update-readme"
  echo ""
}

if [[ "$1" == "-h" ]] || [[ "$1" == "--help" ]]; then
  show_help
  exit 0
fi

TYPE=$1
NAME=$2

if [ -z "$TYPE" ] || [ -z "$NAME" ]; then
  show_help
  exit 1
fi

# Check if TYPE is valid
IS_VALID=0
for t in "${VALID_TYPES[@]}"; do
  if [ "$t" == "$TYPE" ]; then
    IS_VALID=1
    break
  fi
done

if [ $IS_VALID -eq 0 ]; then
  echo "Error: Invalid branch type '$TYPE'."
  echo "Allowed types: ${VALID_TYPES[*]}"
  echo "Use --help for more details."
  exit 1
fi

# Detect user prefix from existing branches
# Looks for branches with a slash, takes the first part before the slash
USER_PREFIX=$(git branch --list | grep '/' | head -n 1 | sed 's/.* //;s/\/.*//' | tr -d ' *')

# Default to 'dev' if detection fails
if [ -z "$USER_PREFIX" ]; then
    echo "Could not detect user prefix from existing branches. Using 'dev'."
    USER_PREFIX="dev"
else
    echo "Detected user prefix: $USER_PREFIX"
fi

BRANCH_NAME="${USER_PREFIX}/${TYPE}/${NAME}"

echo "Creating and switching to branch: $BRANCH_NAME"
git checkout -b "$BRANCH_NAME"
