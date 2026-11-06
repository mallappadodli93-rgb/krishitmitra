"""
AgriSmart AI - PlantVillage Image Downloader (D: Drive Only)
Downloads authentic PlantVillage leaf photographs for Tomato, Potato, and Pepper
directly into D:\\Downloads\\Antigravity\\AgriSmart-AI\\data\\raw\\crop_diseases.
"""

import os
import sys
import json
import urllib.request
import urllib.error
import urllib.parse
import time

TARGET_CLASSES = [
    # Pepper (Bell) - Already downloaded 25 each
    "Pepper__bell___Bacterial_spot",
    "Pepper__bell___healthy",
    # Potato - Already downloaded 25 each
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    # Tomato (10 classes to download)
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites_Two_spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy"
]

# GitHub repository raw color folder names for Tomato
GITHUB_FOLDER_MAP = {
    "Tomato___Bacterial_spot": ["Tomato___Bacterial_spot"],
    "Tomato___Early_blight": ["Tomato___Early_blight"],
    "Tomato___Late_blight": ["Tomato___Late_blight"],
    "Tomato___Leaf_Mold": ["Tomato___Leaf_Mold"],
    "Tomato___Septoria_leaf_spot": ["Tomato___Septoria_leaf_spot"],
    "Tomato___Spider_mites_Two_spotted_spider_mite": [
        "Tomato___Spider_mites Two-spotted_spider_mite",
        "Tomato___Spider_mites_Two_spotted_spider_mite"
    ],
    "Tomato___Target_Spot": ["Tomato___Target_Spot"],
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": ["Tomato___Tomato_Yellow_Leaf_Curl_Virus"],
    "Tomato___Tomato_mosaic_virus": ["Tomato___Tomato_mosaic_virus"],
    "Tomato___healthy": ["Tomato___healthy"]
}

BASE_DIR = os.path.abspath("data/raw/crop_diseases")


def get_headers():
    return {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AgriSmart-AI-Downloader/1.0",
        "Accept": "application/vnd.github.v3+json"
    }


def download_tomato_images(images_per_class: int = 25):
    """
    Downloads Tomato classes directly via GitHub contents API into D: drive.
    """
    print("=" * 70)
    print("🍅 AgriSmart AI - Downloading Tomato PlantVillage Images to D: Drive")
    print(f"Target Directory: {BASE_DIR}")
    print("=" * 70)

    raw_base_url = "https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master"
    total_downloaded = 0

    for class_name, github_folders in GITHUB_FOLDER_MAP.items():
        dest_folder = os.path.join(BASE_DIR, class_name)
        os.makedirs(dest_folder, exist_ok=True)

        # Check existing images
        existing = [f for f in os.listdir(dest_folder) if f.lower().endswith(".jpg") or f.lower().endswith(".jpeg")]
        if len(existing) >= images_per_class:
            print(f"✅ [{class_name}] Already has {len(existing)} images. Skipping.")
            continue

        print(f"\n📂 Fetching file list for [{class_name}] from GitHub...")
        items = []
        for gfolder in github_folders:
            quoted_folder = urllib.parse.quote(gfolder)
            folder_api = f"https://api.github.com/repos/spMohanty/PlantVillage-Dataset/contents/raw/color/{quoted_folder}"
            try:
                req = urllib.request.Request(folder_api, headers=get_headers())
                with urllib.request.urlopen(req, timeout=20) as resp:
                    items = json.loads(resp.read().decode("utf-8"))
                if items:
                    break
            except Exception as e:
                pass

        if not items:
            print(f"   ⚠️ Could not fetch items for {class_name}")
            continue

        file_items = [it for it in items if it.get("type") == "file" and (it["name"].lower().endswith(".jpg") or it["name"].lower().endswith(".jpeg"))]
        selected_items = file_items[:images_per_class]

        print(f"   Found {len(file_items)} images. Downloading {len(selected_items)} into '{dest_folder}'...")
        count = 0
        for it in selected_items:
            fname = it["name"]
            local_path = os.path.join(dest_folder, fname)

            if os.path.exists(local_path) and os.path.getsize(local_path) > 1000:
                count += 1
                continue

            fpath = it["path"]
            quoted_path = urllib.parse.quote(fpath)
            file_url = f"{raw_base_url}/{quoted_path}"

            try:
                img_req = urllib.request.Request(file_url, headers=get_headers())
                with urllib.request.urlopen(img_req, timeout=15) as img_resp:
                    img_data = img_resp.read()
                    with open(local_path, "wb") as out_f:
                        out_f.write(img_data)
                count += 1
                total_downloaded += 1
                if count % 5 == 0 or count == len(selected_items):
                    print(f"   Downloaded {count}/{len(selected_items)} -> {class_name}")
            except Exception as dl_err:
                print(f"   ⚠️ Download error for {fname}: {dl_err}")

            time.sleep(0.04)

        print(f"   ✅ Finished {class_name}: {count} images in '{dest_folder}'")

    print("\n" + "=" * 70)
    print(f"🎉 DOWNLOAD COMPLETE! Downloaded {total_downloaded} Tomato images to D: drive.")
    print("=" * 70)


if __name__ == "__main__":
    download_tomato_images(images_per_class=25)
