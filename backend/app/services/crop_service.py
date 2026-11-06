"""
Location-Based Crop Recommendation Service for AgriSmart AI.
Implements a transparent, multi-criteria agronomic decision engine calibrated
with ICAR (Indian Council of Agricultural Research) and UAS (Bangalore & Dharwad)
Package of Practices.
"""
import logging
from typing import Any, Dict, List, Optional, Tuple

from app.models.schemas import (
    AlternativeCrop,
    CoordinatesQuery,
    CropRecommendationRequest,
    CropRecommendationResponse,
    CropWaterRequirements,
    LocationContext,
    RecommendedCrop,
    RequiredSoilConditions,
)

logger = logging.getLogger("AgriSmartAI.CropService")

# ==============================================================================
# VERIFIED AGRONOMIC KNOWLEDGE BASE (Karnataka & Southern India)
# Sources:
# - ICAR National Bureau of Soil Survey & Land Use Planning (NBSS&LUP)
# - University of Agricultural Sciences (UAS), Bangalore & Dharwad
# - Karnataka State Department of Agriculture (KSDA) Agro-Climatic Zones
# ==============================================================================
VERIFIED_CROPS_DATABASE: List[Dict[str, Any]] = [
    {
        "name": "Ragi (Finger Millet)",
        "ideal_seasons": ["Kharif", "Late Kharif", "All-Season"],
        "duration_days": 115,
        "preferred_soils": ["red soil", "sandy loam", "laterite soil", "loamy"],
        "ideal_ph_min": 5.0,
        "ideal_ph_max": 7.5,
        "water_demand": "Low / Drought-hardy",
        "annual_rainfall_mm": "500 - 850 mm",
        "irrigation_guidance": "Primarily rainfed. Requires only 1-2 protective irrigations at tillering and flowering if dry spells exceed 15 days.",
        "ideal_temp_min": 18.0,
        "ideal_temp_max": 35.0,
        "is_legume": False,
        "karnataka_hotspots": ["mysuru", "mandya", "kolar", "ramanagara", "tumakuru", "hassan", "bengaluru"],
        "key_strength": "Highly resilient staple of Southern Karnataka; tolerates acidic red soils and dry spells with superior nutritional value."
    },
    {
        "name": "Rice (Paddy)",
        "ideal_seasons": ["Kharif", "Rabi"],
        "duration_days": 130,
        "preferred_soils": ["clayey", "clay loam", "alluvial soil", "black soil"],
        "ideal_ph_min": 5.5,
        "ideal_ph_max": 7.2,
        "water_demand": "High / Standing Water",
        "annual_rainfall_mm": "1000 - 1500 mm",
        "irrigation_guidance": "Requires assured continuous water supply or canal irrigation (2-5 cm standing water during vegetative and panicle initiation).",
        "ideal_temp_min": 20.0,
        "ideal_temp_max": 38.0,
        "is_legume": False,
        "karnataka_hotspots": ["mandya", "mysuru", "shivamogga", "udupi", "dakshina kannada", "davangere"],
        "key_strength": "Excellent for heavy soils with assured canal or river basin irrigation (Cauvery and Tungabhadra command areas)."
    },
    {
        "name": "Sugarcane",
        "ideal_seasons": ["All-Season", "Year-round", "Kharif"],
        "duration_days": 360,
        "preferred_soils": ["deep loamy", "black soil", "alluvial soil", "clay loam"],
        "ideal_ph_min": 6.5,
        "ideal_ph_max": 8.0,
        "water_demand": "High / Perennial",
        "annual_rainfall_mm": "1200 - 1800 mm",
        "irrigation_guidance": "Requires heavy, reliable perennial water supply through furrow or drip irrigation across all 12 months.",
        "ideal_temp_min": 20.0,
        "ideal_temp_max": 38.0,
        "is_legume": False,
        "karnataka_hotspots": ["mandya", "belagavi", "bagalkot", "mysuru", "ballari"],
        "key_strength": "High cash-return commercial crop for deep, well-drained fertile soils with guaranteed perennial irrigation."
    },
    {
        "name": "Cotton",
        "ideal_seasons": ["Kharif"],
        "duration_days": 160,
        "preferred_soils": ["black soil", "black cotton soil", "deep alluvial", "clay loam"],
        "ideal_ph_min": 6.2,
        "ideal_ph_max": 8.2,
        "water_demand": "Moderate",
        "annual_rainfall_mm": "650 - 950 mm",
        "irrigation_guidance": "Sensitive to waterlogging. Needs deep root moisture during boll formation with dry sunny weather at harvest.",
        "ideal_temp_min": 21.0,
        "ideal_temp_max": 36.0,
        "is_legume": False,
        "karnataka_hotspots": ["dharwad", "belagavi", "haveri", "raichur", "ballari", "kalaburagi"],
        "key_strength": "Premier commercial fiber crop of Northern Karnataka's deep black vertisols."
    },
    {
        "name": "Maize (Corn)",
        "ideal_seasons": ["Kharif", "Rabi", "All-Season"],
        "duration_days": 105,
        "preferred_soils": ["red soil", "loamy", "black soil", "alluvial soil"],
        "ideal_ph_min": 5.8,
        "ideal_ph_max": 7.5,
        "water_demand": "Moderate",
        "annual_rainfall_mm": "500 - 800 mm",
        "irrigation_guidance": "Requires 4-5 well-timed irrigations during critical stages (tasseling, silking, and grain fill). Sensitive to standing water.",
        "ideal_temp_min": 18.0,
        "ideal_temp_max": 35.0,
        "is_legume": False,
        "karnataka_hotspots": ["davangere", "haveri", "belagavi", "mysuru", "shivamogga", "bagalkot"],
        "key_strength": "Versatile high-yielding cereal adapted to diverse Karnataka soils with strong market demand for poultry feed and starch."
    },
    {
        "name": "Groundnut (Peanut)",
        "ideal_seasons": ["Kharif", "Zaid", "Summer"],
        "duration_days": 110,
        "preferred_soils": ["sandy loam", "red sandy loam", "loamy"],
        "ideal_ph_min": 6.0,
        "ideal_ph_max": 7.5,
        "water_demand": "Low to Moderate",
        "annual_rainfall_mm": "450 - 700 mm",
        "irrigation_guidance": "Needs light, porous soil for easy gynophore (peg) penetration and pod development. 2-3 protective irrigations.",
        "ideal_temp_min": 20.0,
        "ideal_temp_max": 34.0,
        "is_legume": True,
        "karnataka_hotspots": ["tumakuru", "chitradurga", "kolar", "dharwad", "ballari", "chikkaballapura"],
        "key_strength": "Important oilseed legume that enriches soil with biological nitrogen while performing well on lighter sandy/red soils."
    },
    {
        "name": "Tomato / Vegetables",
        "ideal_seasons": ["All-Season", "Kharif", "Rabi", "Zaid"],
        "duration_days": 95,
        "preferred_soils": ["red loam", "sandy loam", "alluvial soil", "loamy"],
        "ideal_ph_min": 6.0,
        "ideal_ph_max": 7.2,
        "water_demand": "Moderate (Drip Ideal)",
        "annual_rainfall_mm": "600 - 900 mm",
        "irrigation_guidance": "Responds exceptionally well to drip fertigation. Needs regular, uniform moisture to prevent blossom end rot and fruit cracking.",
        "ideal_temp_min": 18.0,
        "ideal_temp_max": 32.0,
        "is_legume": False,
        "karnataka_hotspots": ["kolar", "chikkaballapura", "belagavi", "bengaluru rural", "hassan"],
        "key_strength": "Fast-turnaround high-value horticultural crop with intensive market presence in Eastern Karnataka."
    },
    {
        "name": "Chickpea (Bengal Gram / Chana)",
        "ideal_seasons": ["Rabi", "Winter"],
        "duration_days": 100,
        "preferred_soils": ["black soil", "clay loam", "deep loamy"],
        "ideal_ph_min": 6.0,
        "ideal_ph_max": 8.0,
        "water_demand": "Low / Residual Moisture",
        "annual_rainfall_mm": "350 - 550 mm",
        "irrigation_guidance": "Grown on stored residual soil moisture after the monsoon. Requires only 1 light branching-stage irrigation if rain is absent.",
        "ideal_temp_min": 12.0,
        "ideal_temp_max": 28.0,
        "is_legume": True,
        "karnataka_hotspots": ["kalaburagi", "vijayapura", "dharwad", "bagalkot", "gadag", "bidar"],
        "key_strength": "Flagship winter pulse of North Karnataka black soils; thrives on residual moisture and restores nitrogen."
    },
    {
        "name": "Soybean",
        "ideal_seasons": ["Kharif"],
        "duration_days": 100,
        "preferred_soils": ["black soil", "clay loam", "well-drained loam"],
        "ideal_ph_min": 6.0,
        "ideal_ph_max": 7.5,
        "water_demand": "Moderate",
        "annual_rainfall_mm": "600 - 850 mm",
        "irrigation_guidance": "Sensitive to moisture stress at flowering and pod filling. Requires good soil drainage to prevent seedling damping-off.",
        "ideal_temp_min": 20.0,
        "ideal_temp_max": 33.0,
        "is_legume": True,
        "karnataka_hotspots": ["belagavi", "bidar", "dharwad", "haveri"],
        "key_strength": "Dual-purpose protein-rich oilseed and pulse; natural soil fertility builder for Northern Transition zones."
    },
    {
        "name": "Red Gram (Tur / Pigeon Pea)",
        "ideal_seasons": ["Kharif"],
        "duration_days": 165,
        "preferred_soils": ["deep black soil", "red loam", "loamy"],
        "ideal_ph_min": 6.0,
        "ideal_ph_max": 8.2,
        "water_demand": "Moderate / Deep-rooted Drought Hardy",
        "annual_rainfall_mm": "600 - 900 mm",
        "irrigation_guidance": "Extensive deep taproot extracts subsoil water. Needs 1-2 protective irrigations only during pod-setting if drought persists.",
        "ideal_temp_min": 20.0,
        "ideal_temp_max": 35.0,
        "is_legume": True,
        "karnataka_hotspots": ["kalaburagi", "bidar", "raichur", "yadgir", "ballari"],
        "key_strength": "Known as Karnataka's 'Tur Bowl' crop (Kalaburagi GI Tag); exceptional drought endurance and nitrogen fixation."
    }
]

def calculate_suitability_score(
    crop: Dict[str, Any],
    season: str,
    soil_type: str,
    ph: float,
    water_avail: str,
    temp_c: float,
    district: Optional[str]
) -> Tuple[float, List[str]]:
    """
    Evaluates crop compatibility using a documented 100-Point Agronomic Multi-Factor Model:
    1. Season Alignment (max 25 pts)
    2. Soil Texture & pH Match (max 25 pts)
    3. Water Availability & Hydrology (max 25 pts)
    4. Temperature / Climate Suitability (max 15 pts)
    5. Nutrient Adaptability / Regional Affinity (max 10 pts)
    """
    score = 0.0
    reasons: List[str] = []

    clean_season = season.strip().lower()
    clean_soil = soil_type.strip().lower()
    clean_water = water_avail.strip().lower()
    clean_dist = district.strip().lower() if district else ""

    # ==========================================
    # 1. Season Alignment (25 Points)
    # ==========================================
    crop_seasons = [s.lower() for s in crop["ideal_seasons"]]
    if clean_season in crop_seasons:
        score += 25.0
        reasons.append(f"Optimal growing season ({season.title()} aligns perfectly with {crop['name']}'s lifecycle).")
    elif "all-season" in crop_seasons or "year-round" in crop_seasons:
        score += 22.0
        reasons.append(f"Highly flexible season adaptability ({crop['name']} performs well in {season.title()}).")
    else:
        score += 6.0

    # ==========================================
    # 2. Soil Type & pH Match (25 Points)
    # ==========================================
    # 2a. Soil Texture (12.5 pts)
    soil_matched = any(pref in clean_soil or clean_soil in pref for pref in crop["preferred_soils"])
    if soil_matched:
        score += 12.5
        reasons.append(f"Soil texture ({soil_type.title()}) matches the preferred root zone conditions for {crop['name']}.")
    elif "loam" in clean_soil:
        score += 8.5
    else:
        score += 4.0

    # 2b. pH Suitability (12.5 pts)
    if crop["ideal_ph_min"] <= ph <= crop["ideal_ph_max"]:
        score += 12.5
        reasons.append(f"Soil pH {ph:.1f} is well within the ideal nutrient absorption window ({crop['ideal_ph_min']} - {crop['ideal_ph_max']}).")
    elif abs(ph - crop["ideal_ph_min"]) <= 0.6 or abs(ph - crop["ideal_ph_max"]) <= 0.6:
        score += 7.0
        reasons.append(f"Soil pH {ph:.1f} is marginally near the crop threshold ({crop['ideal_ph_min']} - {crop['ideal_ph_max']}).")
    else:
        score += 2.0

    # ==========================================
    # 3. Water Availability & Hydrology (25 Points)
    # ==========================================
    demand = crop["water_demand"].lower()
    if "high" in demand:
        if "abundant" in clean_water or "canal" in clean_water:
            score += 25.0
            reasons.append("Abundant / canal water supply meets this crop's heavy hydrological requirement.")
        elif "moderate" in clean_water or "borewell" in clean_water:
            score += 16.0
            reasons.append("Borewell / moderate water can support this crop with disciplined water management.")
        else: # rainfed
            score += 4.0
    elif "low" in demand or "drought" in demand:
        if "rainfed" in clean_water or "limited" in clean_water:
            score += 25.0
            reasons.append(f"{crop['name']} has superior drought tolerance, making it ideal for rainfed or water-limited farms.")
        else:
            score += 22.0
            reasons.append("Low water requirement ensures low irrigation cost and high water-use efficiency.")
    else: # moderate demand
        if "moderate" in clean_water or "borewell" in clean_water or "abundant" in clean_water:
            score += 24.0
            reasons.append("Moderate irrigation infrastructure matches the crop's moisture curve.")
        else:
            score += 13.0
            reasons.append("Moderate water requirement; supplementary irrigation recommended during dry spells.")

    # ==========================================
    # 4. Temperature Suitability (15 Points)
    # ==========================================
    if crop["ideal_temp_min"] <= temp_c <= crop["ideal_temp_max"]:
        score += 15.0
        reasons.append(f"Prevailing temperature ({temp_c:.1f}°C) is within the safe metabolic growth range ({crop['ideal_temp_min']}°C - {crop['ideal_temp_max']}°C).")
    else:
        score += 8.0

    # ==========================================
    # 5. Nutrient Adaptability & Regional Affinity (10 Points)
    # ==========================================
    if crop["is_legume"]:
        score += 10.0
        reasons.append("Nitrogen-fixing legume that improves soil fertility for subsequent crop cycles.")
    elif clean_dist and any(hotspot in clean_dist for hotspot in crop["karnataka_hotspots"]):
        score += 10.0
        reasons.append(f"Highly recognized high-yielding crop widely cultivated in {district.title()} agro-climatic zone.")
    else:
        score += 7.0

    final_score = max(15.0, min(99.0, score))
    return round(final_score, 1), reasons

def recommend_crops_service(request: CropRecommendationRequest) -> CropRecommendationResponse:
    """
    Core Recommendation Engine:
    1. Normalizes parameters (incorporating weather fallback if needed).
    2. Runs multi-factor scoring across verified agronomic database.
    3. Segregates results into Primary Recommendations and Viable Alternatives.
    4. Attaches full agricultural explanations, soil prerequisites, and disclaimers.
    """
    # 1. Resolve Effective Values
    eff_district = request.district or ""
    eff_state = request.state or "Karnataka"
    eff_season = request.season or "Kharif"
    eff_water = request.water_availability or "Moderate / Borewell"

    # Soil type resolution (from direct field or embedded soil object)
    if request.soil_type:
        eff_soil = request.soil_type
    elif request.soil and request.soil.soil_type:
        eff_soil = request.soil.soil_type
    else:
        # Default based on region if known, else general
        eff_soil = "Red Soil" if "mysuru" in eff_district.lower() or "kolar" in eff_district.lower() else "Black Soil" if "dharwad" in eff_district.lower() else "Loamy Soil"

    # Soil pH resolution
    if request.soil_ph is not None:
        eff_ph = float(request.soil_ph)
    elif request.soil and request.soil.ph is not None:
        eff_ph = float(request.soil.ph)
    else:
        eff_ph = 6.5

    # Temperature resolution
    if request.temperature_c is not None:
        eff_temp = float(request.temperature_c)
        climate_src = "User-specified temperature input"
    else:
        # Fallback to typical regional mean temperature
        eff_temp = 27.0
        climate_src = "Regional seasonal average temperature baseline (27°C)"

    # 2. Evaluate Every Crop in the Knowledge Base
    scored_list: List[Tuple[Dict[str, Any], float, List[str]]] = []

    for crop in VERIFIED_CROPS_DATABASE:
        suit_score, crop_reasons = calculate_suitability_score(
            crop=crop,
            season=eff_season,
            soil_type=eff_soil,
            ph=eff_ph,
            water_avail=eff_water,
            temp_c=eff_temp,
            district=eff_district
        )
        scored_list.append((crop, suit_score, crop_reasons))

    # Sort descending by score
    scored_list.sort(key=lambda x: x[1], reverse=True)

    # 3. Categorize into Primary Recommendations and Alternatives
    primary_recs: List[RecommendedCrop] = []
    alternative_recs: List[AlternativeCrop] = []

    for idx, (crop, c_score, c_reasons) in enumerate(scored_list):
        if c_score >= 85.0:
            category = "Highly Suitable"
        elif c_score >= 70.0:
            category = "Moderately Suitable"
        elif c_score >= 55.0:
            category = "Conditionally Suitable"
        else:
            category = "Marginal / Not Recommended"

        # Top 3 or 4 crops become primary recommendations
        if idx < 3 or (idx == 3 and c_score >= 80.0):
            primary_recs.append(RecommendedCrop(
                crop_name=crop["name"],
                suitability_score=c_score,
                suitability_category=category,
                suitable_growing_season=", ".join(crop["ideal_seasons"]),
                expected_growth_duration_days=crop["duration_days"],
                required_soil_conditions=RequiredSoilConditions(
                    ideal_ph_range=f"{crop['ideal_ph_min']} - {crop['ideal_ph_max']}",
                    preferred_soil_types=[s.title() for s in crop["preferred_soils"]],
                    drainage_need="Well-drained; avoid standing water" if "paddy" not in crop["name"].lower() else "Heavy soil capable of holding standing water"
                ),
                water_requirements=CropWaterRequirements(
                    water_demand_level=crop["water_demand"],
                    seasonal_rainfall_range_mm=crop["annual_rainfall_mm"],
                    irrigation_guidance=crop["irrigation_guidance"]
                ),
                reasons_for_recommendation=c_reasons,
                # Backward compatibility fields
                ideal_temperature_range=f"{crop['ideal_temp_min']}°C - {crop['ideal_temp_max']}°C",
                ideal_rainfall_range=crop["annual_rainfall_mm"],
                reason="; ".join(c_reasons[:2])
            ))
        elif idx < 7 and c_score >= 60.0:
            alternative_recs.append(AlternativeCrop(
                crop_name=crop["name"],
                suitability_score=c_score,
                suitability_category=category,
                suitable_growing_season=", ".join(crop["ideal_seasons"]),
                quick_rationale=crop["key_strength"]
            ))

    loc_context = LocationContext(
        latitude=request.latitude,
        longitude=request.longitude,
        district=eff_district if eff_district else "Unspecified District",
        state=eff_state,
        effective_season=eff_season,
        effective_water_availability=eff_water,
        effective_soil_type=eff_soil,
        effective_ph=eff_ph,
        climate_source=climate_src
    )

    scoring_reference = (
        "Multi-Factor Agronomic Scoring Model (100 Points Total): "
        "Season Alignment (25 pts), Soil Texture & pH Compatibility (25 pts), "
        "Water Availability & Hydrology (25 pts), Temperature / Climate (15 pts), "
        "Nutrient Nitrogen Fixation / Regional Specialty (10 pts). "
        "Calibrated with ICAR & UAS Bangalore / Dharwad Package of Practices."
    )

    disclaimer = (
        "Disclaimer: These crop recommendations are generated using verified agronomic requirements (ICAR/UAS) "
        "matched against user-provided soil, water, and seasonal parameters. "
        "Final crop selection should consider prevailing local market prices, seed availability, and advice from local KVK (Krishi Vigyan Kendra) extension officers."
    )

    return CropRecommendationResponse(
        location=CoordinatesQuery(latitude=request.latitude, longitude=request.longitude),
        location_context=loc_context,
        scoring_model_reference=scoring_reference,
        recommended_crops=primary_recs,
        alternative_crops=alternative_recs,
        agricultural_disclaimer=disclaimer
    )

# Backward compatibility alias
def recommend_crops(request: CropRecommendationRequest):
    return recommend_crops_service(request)
