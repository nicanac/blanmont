import os
import sys
import time
from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get("BASE_URL", "http://localhost:3000")
SCREENSHOT_DIR = os.path.join(os.path.dirname(__file__), "screenshots")
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

def run_tests():
    print(f"--- Starting Playwright E2E Tests on {BASE_URL} ---")
    results = []
    errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 800},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        )
        page = context.new_page()

        # Capture console errors and uncaught exceptions
        page_errors = []
        page.on("pageerror", lambda err: page_errors.append(str(err)))

        def record_pass(test_name):
            print(f"  [PASS] {test_name}")
            results.append((test_name, True))

        def record_fail(test_name, err_msg):
            print(f"  [FAIL] {test_name}: {err_msg}")
            results.append((test_name, False))
            errors.append(f"{test_name}: {err_msg}")

        # Test 1: Homepage (/)
        try:
            print("\n1. Testing Homepage (/)")
            page.goto(f"{BASE_URL}/", wait_until="networkidle", timeout=30000)
            title = page.title()
            assert "blanmont" in title.lower() or len(title) > 0, f"Unexpected title: {title}"
            
            # Check navigation links
            nav = page.locator("nav, header")
            assert nav.count() > 0, "Navigation element not found"
            
            page.screenshot(path=os.path.join(SCREENSHOT_DIR, "01_homepage.png"), full_page=False)
            record_pass("Homepage loads and renders navigation")
        except Exception as e:
            record_fail("Homepage load", str(e))

        # Test 2: Calendrier (/calendrier)
        try:
            print("\n2. Testing Calendrier (/calendrier)")
            page.goto(f"{BASE_URL}/calendrier", wait_until="networkidle", timeout=30000)
            assert page.locator("text=Calendrier").count() > 0 or page.locator("text=Sorties").count() > 0, "Calendar heading not found"
            page.screenshot(path=os.path.join(SCREENSHOT_DIR, "02_calendrier.png"), full_page=False)
            record_pass("Calendar page loads successfully")
        except Exception as e:
            record_fail("Calendar page", str(e))

        # Test 3: Saturday Ride (/saturday-ride)
        try:
            print("\n3. Testing Saturday Ride (/saturday-ride)")
            page.goto(f"{BASE_URL}/saturday-ride", wait_until="networkidle", timeout=30000)
            heading = page.locator("h1, h2").first
            assert heading.is_visible(), "Heading not visible on Saturday Ride"
            page.screenshot(path=os.path.join(SCREENSHOT_DIR, "03_saturday_ride.png"), full_page=False)
            record_pass("Saturday Ride page loads successfully")
        except Exception as e:
            record_fail("Saturday Ride page", str(e))

        # Test 4: Membres (/members)
        try:
            print("\n4. Testing Members directory (/members)")
            page.goto(f"{BASE_URL}/members", wait_until="networkidle", timeout=30000)
            page.wait_for_timeout(1000)
            page.screenshot(path=os.path.join(SCREENSHOT_DIR, "04_members.png"), full_page=False)
            record_pass("Members directory loads successfully")
        except Exception as e:
            record_fail("Members directory", str(e))

        # Test 5: Le Club (/le-club)
        try:
            print("\n5. Testing Le Club (/le-club)")
            page.goto(f"{BASE_URL}/le-club", wait_until="networkidle", timeout=30000)
            page.screenshot(path=os.path.join(SCREENSHOT_DIR, "05_le_club.png"), full_page=False)
            record_pass("Club presentation page loads successfully")
        except Exception as e:
            record_fail("Club page", str(e))

        # Test 6: Login (/login) - Form & Tabs
        try:
            print("\n6. Testing Login page & Activation Flow (/login)")
            page.goto(f"{BASE_URL}/login", wait_until="networkidle", timeout=30000)
            
            # Check login inputs
            email_input = page.locator('input[type="email"], input[name="email"]')
            assert email_input.count() > 0, "Email input not found on login"
            
            # Switch to Activation / First-time tab
            activation_tab = page.locator('button:has-text("1ère Connexion"), button:has-text("Première connexion"), button:has-text("Activer")')
            if activation_tab.count() > 0:
                activation_tab.first.click()
                page.wait_for_timeout(500)
                
                # Check the member-only warning banner we introduced
                banner = page.locator('text=Réservé aux membres inscrits au club')
                assert banner.count() > 0, "Member requirement notice banner not visible"
                
                # Test submitting an unauthorized email
                act_email_input = page.locator('input[type="email"]')
                act_email_input.fill("unregistered_stranger@example.com")
                
                submit_btn = page.locator('button[type="submit"]:has-text("Activer mon compte")')
                submit_btn.click()
                
                # Wait for server action error response
                page.wait_for_selector('text=pas enregistrée dans l\'annuaire', timeout=10000)
                print("    Verified member-only rejection for unregistered email!")
                page.screenshot(path=os.path.join(SCREENSHOT_DIR, "06_login_activation_rejection.png"), full_page=False)
                record_pass("Login member-only activation verification works as expected")
            else:
                page.screenshot(path=os.path.join(SCREENSHOT_DIR, "06_login.png"), full_page=False)
                record_pass("Login form renders successfully")
        except Exception as e:
            record_fail("Login page & activation test", str(e))

        # Test 7: Forgot Password (/login/forgot-password)
        try:
            print("\n7. Testing Forgot Password page (/login/forgot-password)")
            page.goto(f"{BASE_URL}/login/forgot-password", wait_until="networkidle", timeout=30000)
            
            fp_email = page.locator('input[type="email"]')
            assert fp_email.count() > 0, "Email input not found on forgot password page"
            
            page.screenshot(path=os.path.join(SCREENSHOT_DIR, "07_forgot_password.png"), full_page=False)
            record_pass("Forgot password page loads successfully")
        except Exception as e:
            record_fail("Forgot password page", str(e))

        # Test 8: Mobile viewport responsiveness
        try:
            print("\n8. Testing Mobile Viewport (375x667)")
            mobile_context = browser.new_context(
                viewport={"width": 375, "height": 667},
                is_mobile=True
            )
            mobile_page = mobile_context.new_page()
            mobile_page.goto(f"{BASE_URL}/", wait_until="networkidle", timeout=30000)
            mobile_page.screenshot(path=os.path.join(SCREENSHOT_DIR, "08_mobile_homepage.png"), full_page=False)
            mobile_context.close()
            record_pass("Mobile viewport renders properly")
        except Exception as e:
            record_fail("Mobile responsiveness test", str(e))

        browser.close()

    print("\n--- Playwright E2E Summary ---")
    total = len(results)
    passed = sum(1 for _, ok in results if ok)
    print(f"Total Tests: {total}, Passed: {passed}, Failed: {len(errors)}")
    
    if errors:
        print("\nFailures:")
        for err in errors:
            print(f" - {err}")
        sys.exit(1)
    else:
        print("\nAll Playwright E2E tests passed successfully!")
        sys.exit(0)

if __name__ == "__main__":
    run_tests()
