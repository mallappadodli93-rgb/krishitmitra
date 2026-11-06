"""
AgriSmart AI - PlantVillage Dataset Setup Helper
Prepares directory structure and provides download instructions for Tomato, Potato, and Pepper datasets.
"""

import os
from typing import List

PLANTVILLAGE_TARGET_CLASSES: List[str] = [
    # Pepper (Bell)
    "Pepper__bell___Bacterial_spot",
    "Pepper__bell___healthy",
    # Potato
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    # Tomato
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


def prepare_dataset_structure(base_dir: str = "data/raw/crop_diseases"):
    """
    Creates the required directory structure for the 15 supported PlantVillage classes.
    """
    os.makedirs(base_dir, exist_ok=True)
    created = 0
    for class_name in PLANTVILLAGE_TARGET_CLASSES:
        folder_path = os.path.join(base_dir, class_name)
        if not os.path.exists(folder_path):
            os.makedirs(folder_path, exist_ok=True)
            # Create a placeholder .gitkeep
            with open(os.path.join(folder_path, ".gitkeep"), "w") as f:
                pass
            created += 1

    print(f"✅ Prepared directory structure in '{base_dir}'.")
    print(f"   Created {created} class directories for Tomato, Potato, and Pepper.\n")
    print("----------------------------------------------------------------------")
    print("📥 How to Download the PlantVillage Dataset:")
    print("----------------------------------------------------------------------")
    print("Option A (Kaggle Dataset):")
    print("  1. Visit: https://www.kaggle.com/datasets/emmarex/plantdisease")
    print("     or: https://www.kaggle.com/datasets/arjuntejaswi/plant-village")
    print("  2. Download and extract the archive.")
    print("  3. Copy the 15 folders matching Tomato, Potato, and Pepper into:")
    print(f"     '{os.path.abspath(base_dir)}'")
    print("\nOption B (Direct GitHub / Zenodo):")
    print("  1. Clone from: https://github.com/spMohanty/PlantVillage-Dataset")
    print("  2. Copy 'raw/color' folders for Tomato, Potato, and Pepper.")
    print("----------------------------------------------------------------------")


if __name__ == "__main__":
    prepare_dataset_structure()
