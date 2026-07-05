#!/usr/bin/env python3
"""
Verification script for Cnidaria Frames
"""

import os
import sys
import subprocess
import time
import requests

def check_files():
    """Check that all required files exist"""
    required_files = [
        "index.html",
        "manifest.json",
        "sw.js",
        "server.py",
        "start.sh",
        "css/jellyfish.css",
        "js/jellyfish.js",
        "js/main.js"
    ]
    
    missing_files = []
    for file in required_files:
        if not os.path.exists(file):
            missing_files.append(file)
    
    if missing_files:
        print(f"❌ Missing files: {missing_files}")
        return False
    else:
        print("✅ All required files present")
        return True

def check_server():
    """Check that server starts correctly"""
    try:
        # Start server in background
        process = subprocess.Popen(
            ["python3", "server.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Give it a moment to start
        time.sleep(2)
        
        # Check if it's running
        response = requests.get("http://localhost:8282/", timeout=5)
        if response.status_code == 200:
            print("✅ Server is running correctly")
            success = True
        else:
            print(f"❌ Server returned status code {response.status_code}")
            success = False
        
        # Terminate server
        process.terminate()
        process.wait(timeout=5)
        
        return success
    except Exception as e:
        print(f"❌ Server test failed: {e}")
        return False

def main():
    """Main verification function"""
    print("🔍 Verifying Cnidaria Frames installation...")
    
    # Change to project directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Run checks
    files_ok = check_files()
    server_ok = check_server() if files_ok else False
    
    # Summary
    if files_ok and server_ok:
        print("\n🎉 All checks passed! Cnidaria Frames is ready to use.")
        print("\nTo start the server, run:")
        print("  ./start.sh")
        print("\nThen open http://localhost:8282 in your browser")
        return 0
    else:
        print("\n❌ Some checks failed. Please review the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())