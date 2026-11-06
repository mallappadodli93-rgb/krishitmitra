"""
AgriSmart AI - Automated Python 3.11 Installer for D: Drive
Downloads official Python 3.11.9 (64-bit) from python.org and installs it strictly into D:\\Python311.
"""

import os
import sys
import urllib.request
import subprocess

INSTALLER_URL = "https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe"
LOCAL_INSTALLER = os.path.abspath("python_installer_311.exe")
TARGET_DIR = r"D:\Python311"


def install_python_to_d_drive():
    print("=" * 70)
    print("🐍 Installing Python 3.11.9 strictly to D:\\Python311")
    print("=" * 70)

    # Step 1: Download installer
    if not os.path.exists(LOCAL_INSTALLER):
        print(f"Downloading official Python 3.11.9 (64-bit) installer...")
        print(f"URL: {INSTALLER_URL}")
        urllib.request.urlretrieve(INSTALLER_URL, LOCAL_INSTALLER)
        print("✅ Download completed.")
    else:
        print("Installer already downloaded.")

    # Step 2: Run silent installation targeted strictly to D:\Python311
    print(f"Installing Python 3.11 to '{TARGET_DIR}' (silently, no C: changes)...")
    cmd = [
        LOCAL_INSTALLER,
        "/quiet",
        "InstallAllUsers=0",
        f"TargetDir={TARGET_DIR}",
        "PrependPath=0",
        "Include_pip=1",
        "Include_test=0",
        "Shortcuts=0"
    ]
    
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        print(f"⚠️ Installer returncode: {proc.returncode}. Output: {proc.stderr}")

    # Step 3: Verify target python.exe
    python_exe = os.path.join(TARGET_DIR, "python.exe")
    if os.path.exists(python_exe):
        ver_proc = subprocess.run([python_exe, "--version"], capture_output=True, text=True)
        print(f"\n🎉 SUCCESS! Python 3.11 installed at: {python_exe}")
        print(f"Version: {ver_proc.stdout.strip()}")
    else:
        print(f"❌ Could not locate {python_exe} after installation.")
        return False

    # Cleanup installer file
    if os.path.exists(LOCAL_INSTALLER):
        os.remove(LOCAL_INSTALLER)
        print("Cleaned up installer executable.")

    return True


if __name__ == "__main__":
    install_python_to_d_drive()

