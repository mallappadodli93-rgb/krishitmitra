"""
Soil Health Analyzer Service for AgriSmart AI.
Analyzes soil pH, NPK, moisture, and soil texture using ICAR (Indian Council of
Agricultural Research) and FAO reference benchmarks. Provides farmer-friendly
recommendations, deficiency detection, and organic soil amendment strategies.
"""
import logging
from typing import Any, Dict, List, Optional, Tuple

from app.models.schemas import (
    SoilAnalysisRequest,
    SoilHealthReport,
    SoilNutrientStatus,
    SoilPhAssessment,
    SoilTypeInsight,
)

logger = logging.getLogger("AgriSmartAI.SoilService")

# ==============================================================================
# CONFIGURABLE REFERENCE BENCHMARKS
# Source: ICAR (Indian Council of Agricultural Research) Soil Health Card Manual & FAO
# Benchmark units: Available nutrients in Kilograms per Hectare (kg/ha)
# ==============================================================================
SOIL_NUTRIENT_BENCHMARKS = {
    "nitrogen": {
        "unit": "kg/ha",
        "low_threshold": 280.0,
        "high_threshold": 560.0,
        "source": "ICAR Soil Health Card Standard Classification",
        "description": "Essential for leaf and vegetative canopy growth, chlorophyll synthesis, and protein formation."
    },
    "phosphorus": {
        "unit": "kg/ha",
        "low_threshold": 10.0,
        "high_threshold": 25.0,
        "source": "ICAR Soil Health Card Standard Classification (Olsen P method)",
        "description": "Crucial for early root development, seed germination, flowering, and energy transfer (ATP)."
    },
    "potassium": {
        "unit": "kg/ha",
        "low_threshold": 110.0,
        "high_threshold": 280.0,
        "source": "ICAR Soil Health Card Standard Classification (Neutral Normal Ammonium Acetate method)",
        "description": "Enhances disease resistance, drought tolerance, stem strength, and grain/fruit quality."
    }
}

# Agronomic Soil Characteristics per Texture Type
SOIL_TYPE_PROFILES: Dict[str, Dict[str, str]] = {
    "red soil": {
        "name": "Red Soil (Alfisols)",
        "drainage": "Good to excessive drainage, porous structure, low water-holding capacity.",
        "nutrient_capacity": "Low to medium Cation Exchange Capacity (CEC); naturally low in Nitrogen, Phosphorus, and Humus.",
        "consideration": "Prone to phosphorus fixation (binding with iron/aluminum). Band placement of phosphate fertilizers and organic matter addition are essential."
    },
    "black soil": {
        "name": "Black Cotton Soil (Vertisols / Regur)",
        "drainage": "Slow internal drainage; expands when wet and cracks deeply when dry.",
        "nutrient_capacity": "High Cation Exchange Capacity (CEC); rich in Calcium, Magnesium, and Potassium; moderate to low in Nitrogen.",
        "consideration": "High moisture retention. Ensure good surface drainage to prevent water stagnation and root rot during continuous rains."
    },
    "alluvial soil": {
        "name": "Alluvial Soil (Entisols / Inceptisols)",
        "drainage": "Well-balanced drainage and aeration; highly responsive to irrigation.",
        "nutrient_capacity": "Moderate to high fertility; generally adequate Potassium, but responds vigorously to Nitrogen and Phosphorus.",
        "consideration": "Maintain organic matter through crop rotation with pulses (green gram, chickpea) to sustain high yields."
    },
    "sandy loam": {
        "name": "Sandy Loam Soil",
        "drainage": "Rapid infiltration and free drainage; low water retention.",
        "nutrient_capacity": "Low nutrient-holding capacity; highly susceptible to nutrient leaching (especially Nitrogen and Potassium).",
        "consideration": "Apply nutrients in small, frequent split doses instead of a single heavy dose. Incorporate compost or mulching to boost moisture retention."
    },
    "clayey": {
        "name": "Clayey Soil",
        "drainage": "Heavy texture, slow permeability, high compaction risk if worked wet.",
        "nutrient_capacity": "Very high nutrient retention; holds nutrients tightly.",
        "consideration": "Incorporate well-decomposed farmyard manure (FYM) to improve soil aggregation, aeration, and root penetration."
    },
    "laterite soil": {
        "name": "Laterite Soil (Oxisols)",
        "drainage": "Porous with rapid permeability; heavily leached by tropical rains.",
        "nutrient_capacity": "Very low fertility; low in organic matter, Potassium, and available Phosphorus; naturally acidic.",
        "consideration": "Requires regular liming to counter acidity, alongside green manuring (Dhaincha, Sunnhemp) and rock phosphate application."
    }
}

def get_soil_profile(soil_type_input: Optional[str]) -> Tuple[str, Dict[str, str]]:
    """Resolves user input soil type to the closest agronomic profile."""
    if not soil_type_input:
        return "Alluvial Soil", SOIL_TYPE_PROFILES["alluvial soil"]

    key = soil_type_input.strip().lower()
    for profile_key, profile_data in SOIL_TYPE_PROFILES.items():
        if profile_key in key or key in profile_key:
            return profile_data["name"], profile_data

    # Default fallback
    return soil_type_input.title(), {
        "name": soil_type_input.title(),
        "drainage": "Moderate drainage typical of mixed agricultural soil.",
        "nutrient_capacity": "Standard nutrient holding capacity.",
        "consideration": "Maintain regular additions of well-rotted organic compost to support soil microbes."
    }

def assess_soil_ph(ph: float) -> SoilPhAssessment:
    """
    Evaluates soil pH against agronomic thresholds:
    - Strongly Acidic (< 5.5)
    - Moderately Acidic (5.5 - 6.5)
    - Neutral / Optimal (6.5 - 7.5)
    - Moderately Alkaline (7.5 - 8.5)
    - Strongly Alkaline (> 8.5)
    """
    if ph < 5.5:
        category = "Strongly Acidic"
        status = "ACIDIC"
        explanation = (
            f"pH {ph:.1f} is strongly acidic. Plant roots struggle to absorb Phosphorus, Potassium, Calcium, "
            "and Magnesium, while Aluminum and Manganese can reach toxic levels."
        )
        amendment = (
            "Apply agricultural limestone (calcium carbonate) or dolomite at recommended rates (typically 1 to 2 tons/acre "
            "based on buffer pH). Broadcast 3 to 4 weeks before sowing and incorporate into the top 6 inches of soil."
        )
    elif 5.5 <= ph < 6.5:
        category = "Moderately Acidic"
        status = "SLIGHTLY ACIDIC"
        explanation = (
            f"pH {ph:.1f} is slightly acidic. Most cereals, millets, and tubers grow well, but legumes may have slightly reduced "
            "nodule formation for biological nitrogen fixation."
        )
        amendment = (
            "Apply light agricultural lime or wood ash if cultivating sensitive crops (like pulses or cabbage). "
            "Regular addition of organic farmyard manure will naturally buffer the acidity over time."
        )
    elif 6.5 <= ph <= 7.5:
        category = "Neutral / Optimal"
        status = "OPTIMAL"
        explanation = (
            f"pH {ph:.1f} is in the ideal sweet spot for Indian agriculture. Most plant nutrients are at their maximum "
            "solubility and biological root availability. Beneficial earthworms and soil bacteria thrive here."
        )
        amendment = "No chemical corrective amendment needed. Maintain this ideal balance with compost and balanced fertilization."
    elif 7.5 < ph <= 8.5:
        category = "Moderately Alkaline"
        status = "SLIGHTLY ALKALINE"
        explanation = (
            f"pH {ph:.1f} is moderately alkaline. Micronutrient availability (particularly Iron, Zinc, and Manganese) is reduced, "
            "which can cause young leaves to turn pale yellow (interveinal chlorosis)."
        )
        amendment = (
            "Apply well-decomposed organic compost or press mud. Consider foliar sprays of chelated Zinc and Iron if "
            "deficiency symptoms appear on crops."
        )
    else:
        category = "Strongly Alkaline / Sodic"
        status = "ALKALINE"
        explanation = (
            f"pH {ph:.1f} is strongly alkaline/sodic. High sodium and carbonate levels disperse soil structure, causing severe "
            "crusting, poor water infiltration, and stunted root respiration."
        )
        amendment = (
            "Apply agricultural gypsum (calcium sulfate) followed by leaching with clean irrigation water. "
            "Incorporate green manure crops like Dhaincha (Sesbania aculeata) to release organic acids and restore soil porosity."
        )

    return SoilPhAssessment(
        ph_value=round(ph, 1),
        category=category,
        status=status,
        simple_explanation=explanation,
        corrective_amendment=amendment
    )

def assess_individual_nutrient(
    nutrient_key: str,
    value: float,
    soil_type_name: str
) -> SoilNutrientStatus:
    """Evaluates N, P, or K value against ICAR reference benchmarks with soil-specific considerations."""
    cfg = SOIL_NUTRIENT_BENCHMARKS[nutrient_key]
    low_thresh = cfg["low_threshold"]
    high_thresh = cfg["high_threshold"]
    unit = cfg["unit"]

    names_map = {
        "nitrogen": ("Nitrogen (N)", "N"),
        "phosphorus": ("Phosphorus (P2O5)", "P"),
        "potassium": ("Potassium (K2O)", "K")
    }
    formal_name, symbol = names_map[nutrient_key]

    if value < low_thresh:
        level = "DEFICIENT / LOW"
        ref_text = f"Deficient: < {low_thresh:.0f} {unit} | Optimal: {low_thresh:.0f} - {high_thresh:.0f} {unit}"
        
        if nutrient_key == "nitrogen":
            simple_exp = f"Nitrogen is low at {value:.1f} {unit}. Plants may show yellowing on older lower leaves and slow, stunted growth."
            recom = (
                "Supplement nitrogen using organic compost, vermicompost, and biofertilizers (Azotobacter for cereals, Rhizobium for legumes). "
                "For synthetic supplementation, use split urea or neem-coated urea applications to prevent leaching."
            )
        elif nutrient_key == "phosphorus":
            simple_exp = f"Phosphorus is low at {value:.1f} {unit}. Root growth will be sluggish and flowering/seed formation may be delayed."
            if "red" in soil_type_name.lower():
                recom = (
                    "In Red Soil, phosphorus easily gets bound to iron particles. Apply phosphorus via band placement near roots "
                    "rather than surface broadcasting. Inoculate seeds with Phosphate Solubilizing Bacteria (PSB) or mycorrhiza."
                )
            else:
                recom = (
                    "Apply decomposed farmyard manure mixed with Single Super Phosphate (SSP) or rock phosphate. "
                    "Use PSB (Phosphate Solubilizing Bacteria) seed treatment to mobilize fixed phosphorus."
                )
        else: # potassium
            simple_exp = f"Potassium is low at {value:.1f} {unit}. Leaf edges may appear scorched or burnt, and crops will be more prone to pests and lodging."
            recom = (
                "Incorporate wood ash, crop residues, or organic mulch. If using potash fertilizers (MOP), "
                "apply in split doses especially on light or sandy soils to prevent leaching."
            )

    elif value > high_thresh:
        level = "EXCESS / HIGH"
        ref_text = f"Excess: > {high_thresh:.0f} {unit} | Optimal: {low_thresh:.0f} - {high_thresh:.0f} {unit}"
        
        if nutrient_key == "nitrogen":
            simple_exp = f"Nitrogen is excessive at {value:.1f} {unit}. Causes dark green soft vegetative growth, delayed maturity, and high pest attraction."
            recom = "Halt all nitrogenous fertilizer and raw manure applications. Irrigate adequately to leach excess nitrates from the root zone."
        elif nutrient_key == "phosphorus":
            simple_exp = f"Phosphorus is high at {value:.1f} {unit}. While not directly toxic to plants, excessive phosphorus blocks the uptake of Zinc and Iron."
            recom = "Do not add any phosphorus fertilizers. Monitor plants for micro-nutrient deficiencies, especially Zinc chlorosis."
        else:
            simple_exp = f"Potassium is abundant at {value:.1f} {unit}. Extremely high potassium can inhibit plant absorption of Magnesium and Calcium."
            recom = "Avoid applying potash. Ensure balanced irrigation and test for adequate Magnesium in the next seasonal test."

    else:
        level = "OPTIMAL / MEDIUM"
        ref_text = f"Optimal: {low_thresh:.0f} - {high_thresh:.0f} {unit}"
        simple_exp = f"{formal_name} level is balanced and healthy at {value:.1f} {unit}."
        recom = f"Maintain this balanced level with regular seasonal additions of organic manure and crop residue recycling."

    return SoilNutrientStatus(
        nutrient=formal_name,
        value=round(value, 1),
        unit=unit,
        level=level,
        reference_range=ref_text,
        simple_explanation=simple_exp,
        recommendation=recom
    )

def evaluate_moisture_level(moisture_pct: Optional[float], soil_name: str) -> Optional[str]:
    """Generates simple moisture assessment if provided."""
    if moisture_pct is None:
        return None
    if moisture_pct < 15.0:
        return f"{moisture_pct:.1f}% - DRY. Soil moisture is below optimum. Plan immediate irrigation before planting or fertilizing."
    elif 15.0 <= moisture_pct <= 35.0:
        return f"{moisture_pct:.1f}% - OPTIMAL. Adequate moisture for seed germination, nutrient uptake, and root respiration."
    else:
        return f"{moisture_pct:.1f}% - SATURATED. Excessive moisture detected. Avoid heavy machinery to prevent compaction, and ensure drainage is clear."

def analyze_soil_health(data: SoilAnalysisRequest) -> SoilHealthReport:
    """
    Main service function:
    1. Validates input values.
    2. Classifies pH and assesses acidity/alkalinity amendments.
    3. Analyzes N, P, K against ICAR standards.
    4. Evaluates soil type characteristics.
    5. Computes overall Soil Health Score (0 to 100) and human-friendly grading.
    6. Formulates clear, beginner-friendly recommendations.
    """
    # 1. Soil Type Profile
    resolved_name, profile = get_soil_profile(data.soil_type)
    moisture_note = evaluate_moisture_level(data.soil_moisture_pct, resolved_name)

    type_insight = SoilTypeInsight(
        soil_type=resolved_name,
        drainage_characteristics=profile["drainage"],
        nutrient_holding_capacity=profile["nutrient_capacity"],
        special_consideration=profile["consideration"],
        moisture_status=moisture_note
    )

    # 2. pH Evaluation
    ph_assessment = assess_soil_ph(data.ph)

    # 3. Nutrient Evaluation (N, P, K)
    n_status = assess_individual_nutrient("nitrogen", data.nitrogen, resolved_name)
    p_status = assess_individual_nutrient("phosphorus", data.phosphorus, resolved_name)
    k_status = assess_individual_nutrient("potassium", data.potassium, resolved_name)
    nutrient_list = [n_status, p_status, k_status]

    # 4. Overall Health Scoring (Base 100 points)
    score = 100.0

    # pH Deductions
    if ph_assessment.category in ("Strongly Acidic", "Strongly Alkaline / Sodic"):
        score -= 25.0
    elif ph_assessment.category in ("Moderately Acidic", "Moderately Alkaline"):
        score -= 10.0

    # Nutrient Deductions
    for item in nutrient_list:
        if "DEFICIENT" in item.level:
            score -= 15.0
        elif "EXCESS" in item.level:
            score -= 10.0

    # Organic carbon bonus/deduction if provided
    if data.organic_carbon_pct is not None:
        if data.organic_carbon_pct < 0.5:
            score -= 10.0
        elif data.organic_carbon_pct >= 0.75:
            score += 5.0

    score = max(10.0, min(100.0, score))
    final_score = round(score, 1)

    # Health Rating
    if final_score >= 85.0:
        rating = "EXCELLENT"
        verdict = "Your soil is fertile, nutrient-balanced, and primed for high crop productivity."
    elif final_score >= 70.0:
        rating = "GOOD"
        verdict = "Your soil has satisfactory overall health with minor nutrient or pH adjustments recommended."
    elif final_score >= 50.0:
        rating = "FAIR"
        verdict = "Moderate soil health issues detected. Actionable nutrient and organic additions are needed to reach full yield potential."
    else:
        rating = "POOR"
        verdict = "Soil health is constrained by severe pH imbalance or significant nutrient deficiencies requiring systematic soil conditioning."

    # 5. Compile Actionable Recommendations
    actionable_recs: List[str] = []

    # pH recommendation
    if ph_assessment.status != "OPTIMAL":
        actionable_recs.append(f"pH Correction: {ph_assessment.corrective_amendment}")

    # Nutrient recommendations
    for n_item in nutrient_list:
        if "DEFICIENT" in n_item.level:
            actionable_recs.append(f"{n_item.nutrient} Boost: {n_item.recommendation}")
        elif "EXCESS" in n_item.level:
            actionable_recs.append(f"{n_item.nutrient} Management: {n_item.recommendation}")

    # Organic matter / soil type recommendation
    actionable_recs.append(f"Texture Advice ({resolved_name}): {profile['consideration']}")
    if data.organic_carbon_pct is not None and data.organic_carbon_pct < 0.5:
        actionable_recs.append("Organic Carbon Boost: Apply 4-5 tons/acre of farmyard manure (FYM) or vermicompost to enrich microbial biomass.")

    # General biological soil health recommendation
    actionable_recs.append(
        "Biological Care: Adopt crop rotation with leguminous green manure crops (Dhaincha or Cowpea) "
        "every 2-3 seasons to naturally replenish soil biology and structure."
    )

    return SoilHealthReport(
        ph_category=ph_assessment.category,
        overall_health_score=final_score,
        health_rating=rating,
        summary_verdict=verdict,
        ph_assessment=ph_assessment,
        nutrient_analysis=nutrient_list,
        soil_type_insight=type_insight,
        actionable_recommendations=actionable_recs,
        general_recommendations=actionable_recs
    )
