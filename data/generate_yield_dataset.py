"""
AgriSmart AI - Crop Yield Dataset Generator
Generates a realistic, benchmarked agricultural yield dataset (4,000 records)
based on Indian Council of Agricultural Research (ICAR) and Ministry of Agriculture statistics.

Features:
- Crop Type (12 major crops: Cereals, Cash Crops, Oilseeds, Vegetables)
- Location / State (12 major agricultural states across agro-climatic zones)
- Season (Kharif, Rabi, Summer, Whole Year)
- Land Area (hectares)
- Annual / Seasonal Rainfall (mm)
- Mean Ambient Temperature (°C)
- Soil Type (Alluvial, Black Soil, Red Soil, Clay Loam, Sandy Loam, Laterite)
- Soil pH (5.0 - 8.5)
- Fertilizer Applied (kg)
- Pesticide Applied (kg)
- Yield (target: Metric Tons per hectare)
Includes realistic missing values (~3%) to demonstrate preprocessing & imputation.
"""

import os
import csv
import random
import math

def generate_yield_dataset(output_path: str = "data/raw/crop_yield.csv", num_records: int = 4000):
    random.seed(42)

    # Agronomic crop benchmarks: base yield (tons/ha), optimal rainfall (mm), optimal temp (°C), optimal pH
    CROP_PROFILES = {
        "Rice": {
            "seasons": ["Kharif", "Summer"],
            "states": ["West Bengal", "Karnataka", "Punjab", "Uttar Pradesh", "Andhra Pradesh", "Tamil Nadu", "Bihar"],
            "base_yield": 3.4,
            "yield_std": 0.6,
            "min_yield": 1.5,
            "max_yield": 5.2,
            "opt_rain": 1200,
            "opt_temp": 27.0,
            "opt_ph": 6.2,
            "fert_rate": 110.0,
            "pest_rate": 3.5,
            "preferred_soils": ["Clay Loam", "Alluvial", "Red Soil"]
        },
        "Wheat": {
            "seasons": ["Rabi"],
            "states": ["Punjab", "Haryana", "Uttar Pradesh", "Madhya Pradesh", "Rajasthan", "Bihar"],
            "base_yield": 3.8,
            "yield_std": 0.5,
            "min_yield": 2.0,
            "max_yield": 5.5,
            "opt_rain": 550,
            "opt_temp": 20.0,
            "opt_ph": 6.8,
            "fert_rate": 120.0,
            "pest_rate": 2.5,
            "preferred_soils": ["Alluvial", "Clay Loam", "Sandy Loam"]
        },
        "Maize": {
            "seasons": ["Kharif", "Rabi"],
            "states": ["Karnataka", "Madhya Pradesh", "Bihar", "Tamil Nadu", "Maharashtra", "Rajasthan"],
            "base_yield": 3.2,
            "yield_std": 0.5,
            "min_yield": 1.8,
            "max_yield": 5.0,
            "opt_rain": 750,
            "opt_temp": 25.0,
            "opt_ph": 6.5,
            "fert_rate": 105.0,
            "pest_rate": 3.0,
            "preferred_soils": ["Sandy Loam", "Red Soil", "Alluvial"]
        },
        "Cotton": {
            "seasons": ["Kharif"],
            "states": ["Gujarat", "Maharashtra", "Karnataka", "Andhra Pradesh", "Haryana", "Punjab"],
            "base_yield": 1.8,
            "yield_std": 0.35,
            "min_yield": 0.9,
            "max_yield": 2.8,
            "opt_rain": 700,
            "opt_temp": 30.0,
            "opt_ph": 7.2,
            "fert_rate": 95.0,
            "pest_rate": 6.5,
            "preferred_soils": ["Black Soil", "Alluvial", "Red Soil"]
        },
        "Sugarcane": {
            "seasons": ["Whole Year"],
            "states": ["Uttar Pradesh", "Maharashtra", "Karnataka", "Tamil Nadu", "Bihar"],
            "base_yield": 65.0,
            "yield_std": 9.0,
            "min_yield": 40.0,
            "max_yield": 95.0,
            "opt_rain": 1400,
            "opt_temp": 32.0,
            "opt_ph": 6.8,
            "fert_rate": 240.0,
            "pest_rate": 5.0,
            "preferred_soils": ["Alluvial", "Black Soil", "Clay Loam"]
        },
        "Soybean": {
            "seasons": ["Kharif"],
            "states": ["Madhya Pradesh", "Maharashtra", "Rajasthan", "Karnataka", "Gujarat"],
            "base_yield": 1.9,
            "yield_std": 0.35,
            "min_yield": 1.0,
            "max_yield": 3.0,
            "opt_rain": 850,
            "opt_temp": 28.0,
            "opt_ph": 6.5,
            "fert_rate": 80.0,
            "pest_rate": 3.8,
            "preferred_soils": ["Black Soil", "Clay Loam", "Alluvial"]
        },
        "Groundnut": {
            "seasons": ["Kharif", "Summer"],
            "states": ["Gujarat", "Rajasthan", "Tamil Nadu", "Andhra Pradesh", "Karnataka"],
            "base_yield": 1.7,
            "yield_std": 0.3,
            "min_yield": 0.9,
            "max_yield": 2.7,
            "opt_rain": 600,
            "opt_temp": 27.0,
            "opt_ph": 6.4,
            "fert_rate": 70.0,
            "pest_rate": 3.0,
            "preferred_soils": ["Sandy Loam", "Red Soil", "Laterite"]
        },
        "Pulses": {
            "seasons": ["Rabi", "Kharif"],
            "states": ["Madhya Pradesh", "Rajasthan", "Maharashtra", "Karnataka", "Uttar Pradesh"],
            "base_yield": 1.1,
            "yield_std": 0.25,
            "min_yield": 0.6,
            "max_yield": 2.0,
            "opt_rain": 500,
            "opt_temp": 23.0,
            "opt_ph": 7.0,
            "fert_rate": 45.0,
            "pest_rate": 2.2,
            "preferred_soils": ["Sandy Loam", "Black Soil", "Alluvial"]
        },
        "Potato": {
            "seasons": ["Rabi"],
            "states": ["Uttar Pradesh", "West Bengal", "Bihar", "Punjab", "Gujarat"],
            "base_yield": 23.0,
            "yield_std": 3.5,
            "min_yield": 14.0,
            "max_yield": 34.0,
            "opt_rain": 650,
            "opt_temp": 18.0,
            "opt_ph": 5.8,
            "fert_rate": 180.0,
            "pest_rate": 4.5,
            "preferred_soils": ["Sandy Loam", "Alluvial", "Clay Loam"]
        },
        "Tomato": {
            "seasons": ["Kharif", "Rabi", "Summer"],
            "states": ["Karnataka", "Andhra Pradesh", "Madhya Pradesh", "Maharashtra", "Tamil Nadu"],
            "base_yield": 25.0,
            "yield_std": 4.0,
            "min_yield": 15.0,
            "max_yield": 38.0,
            "opt_rain": 750,
            "opt_temp": 24.0,
            "opt_ph": 6.4,
            "fert_rate": 190.0,
            "pest_rate": 5.5,
            "preferred_soils": ["Red Soil", "Sandy Loam", "Clay Loam"]
        },
        "Mustard": {
            "seasons": ["Rabi"],
            "states": ["Rajasthan", "Haryana", "Madhya Pradesh", "Uttar Pradesh", "West Bengal"],
            "base_yield": 1.5,
            "yield_std": 0.3,
            "min_yield": 0.8,
            "max_yield": 2.4,
            "opt_rain": 450,
            "opt_temp": 19.0,
            "opt_ph": 6.8,
            "fert_rate": 75.0,
            "pest_rate": 2.0,
            "preferred_soils": ["Sandy Loam", "Alluvial", "Clay Loam"]
        },
        "Onion": {
            "seasons": ["Kharif", "Rabi"],
            "states": ["Maharashtra", "Karnataka", "Madhya Pradesh", "Gujarat", "Bihar"],
            "base_yield": 18.0,
            "yield_std": 3.0,
            "min_yield": 10.0,
            "max_yield": 28.0,
            "opt_rain": 700,
            "opt_temp": 23.0,
            "opt_ph": 6.6,
            "fert_rate": 150.0,
            "pest_rate": 4.0,
            "preferred_soils": ["Clay Loam", "Red Soil", "Alluvial"]
        }
    }

    ALL_SOILS = ["Alluvial", "Black Soil", "Red Soil", "Clay Loam", "Sandy Loam", "Laterite"]

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    crops = list(CROP_PROFILES.keys())

    records = []
    headers = [
        "Crop", "Location", "Season", "Area_Hectares",
        "Rainfall_mm", "Temperature_C", "Soil_Type",
        "Soil_pH", "Fertilizer_kg", "Pesticide_kg", "Yield_Tons_Per_Hectare"
    ]

    for _ in range(num_records):
        crop = random.choice(crops)
        prof = CROP_PROFILES[crop]

        season = random.choice(prof["seasons"])
        location = random.choice(prof["states"])
        area = round(random.uniform(0.5, 30.0), 2)

        # Environmental factors with natural variance around crop optima
        rainfall = round(max(200.0, random.gauss(prof["opt_rain"], 180.0)), 1)
        temp = round(max(12.0, min(42.0, random.gauss(prof["opt_temp"], 3.5))), 1)

        # Soil type: 75% chance preferred, 25% other
        if random.random() < 0.75:
            soil_type = random.choice(prof["preferred_soils"])
        else:
            soil_type = random.choice(ALL_SOILS)

        # Soil pH: around crop optimum
        soil_ph = round(max(4.8, min(8.8, random.gauss(prof["opt_ph"], 0.5))), 2)

        # Inputs proportional to area
        fert_kg = round(area * max(10.0, random.gauss(prof["fert_rate"], prof["fert_rate"] * 0.15)), 1)
        pest_kg = round(area * max(0.5, random.gauss(prof["pest_rate"], prof["pest_rate"] * 0.2)), 2)

        # Agronomic yield response formula
        # 1. Base potential
        yield_val = random.gauss(prof["base_yield"], prof["yield_std"])

        # 2. Rainfall penalty if far from optimum
        rain_diff = abs(rainfall - prof["opt_rain"]) / prof["opt_rain"]
        rain_factor = max(0.70, 1.0 - (rain_diff * 0.35))

        # 3. Temperature penalty if far from optimum
        temp_diff = abs(temp - prof["opt_temp"]) / prof["opt_temp"]
        temp_factor = max(0.75, 1.0 - (temp_diff * 0.40))

        # 4. Soil pH penalty
        ph_diff = abs(soil_ph - prof["opt_ph"])
        ph_factor = max(0.80, 1.0 - (ph_diff * 0.12))

        # 5. Soil type multiplier
        soil_factor = 1.05 if soil_type in prof["preferred_soils"] else 0.92

        # 6. Fertilizer / Input efficiency factor
        fert_per_ha = fert_kg / area
        fert_ratio = fert_per_ha / prof["fert_rate"]
        fert_factor = min(1.15, max(0.85, 0.85 + 0.30 * (fert_ratio / (1.0 + fert_ratio))))

        final_yield = yield_val * rain_factor * temp_factor * ph_factor * soil_factor * fert_factor
        final_yield = round(max(prof["min_yield"], min(prof["max_yield"], final_yield)), 2)

        # Simulate 2.5% realistic missing values in non-critical columns to test imputation
        fert_str = str(fert_kg) if random.random() > 0.025 else ""
        pest_str = str(pest_kg) if random.random() > 0.025 else ""
        ph_str = str(soil_ph) if random.random() > 0.025 else ""
        soil_str = soil_type if random.random() > 0.025 else ""
        rain_str = str(rainfall) if random.random() > 0.025 else ""

        records.append([
            crop, location, season, str(area),
            rain_str, str(temp), soil_str,
            ph_str, fert_str, pest_str, str(final_yield)
        ])

    with open(output_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(records)

    print(f"✅ Generated {len(records)} realistic agricultural yield records at: {output_path}")

if __name__ == "__main__":
    generate_yield_dataset()
