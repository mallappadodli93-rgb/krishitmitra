"""
Crop Disease Prevention & Treatment Knowledge Base
Provides actionable, organic, and scientific recommendations for common crop diseases.
"""

from typing import Dict, Any

# Structured agronomic prevention and management advice for common crop diseases
DISEASE_RECOMMENDATIONS: Dict[str, Dict[str, Any]] = {
    "Tomato_Early_Blight": {
        "disease_name": "Tomato Early Blight (Alternaria solani)",
        "prevention": [
            "Practice 2-3 year crop rotation with non-solanaceous crops.",
            "Water at the base of plants in the morning to keep foliage dry.",
            "Mulch around plants to prevent soil-borne spores from splashing onto lower leaves.",
            "Prune bottom leaves touching the ground to improve air circulation."
        ],
        "organic_treatment": [
            "Apply copper-based organic fungicides or neem seed extract spray.",
            "Spray bio-fungicides containing Bacillus subtilis or Trichoderma viride."
        ],
        "chemical_control": [
            "Use protective fungicides like Mancozeb 75% WP (2g/L) or Chlorothalonil.",
            "In severe stages, spray systemic fungicides like Difenoconazole or Azoxystrobin."
        ]
    },
    "Tomato_Late_Blight": {
        "disease_name": "Tomato Late Blight (Phytophthora infestans)",
        "prevention": [
            "Plant certified disease-free and resistant hybrid varieties.",
            "Ensure proper field drainage and avoid overhead sprinkler irrigation.",
            "Destroy and bury infected plant residue immediately; do not compost."
        ],
        "organic_treatment": [
            "Apply Bordeaux mixture (1%) or copper oxychloride in early vegetative stage.",
            "Spray bio-control agents like Pseudomonas fluorescens."
        ],
        "chemical_control": [
            "Apply Metalaxyl + Mancozeb (Ridomil MZ @ 2.5g/L).",
            "Spray Cymoxanil + Mancozeb at early outbreak stage."
        ]
    },
    "Potato_Late_Blight": {
        "disease_name": "Potato Late Blight (Phytophthora infestans)",
        "prevention": [
            "Use certified healthy seed tubers from trusted agricultural institutions.",
            "Proper hilling (earthing up) to protect developing tubers from falling spores.",
            "Eliminate cull piles and volunteer potato plants near the field."
        ],
        "organic_treatment": [
            "Spray Copper Hydroxide or Copper Oxychloride prior to rainy conditions.",
            "Apply garlic or neem leaf extracts as preventive deterrents."
        ],
        "chemical_control": [
            "Preventive spray of Mancozeb (2.5 g/L).",
            "Curative spray of Dimethomorph (1 g/L) or Metalaxyl."
        ]
    },
    "Rice_Blast": {
        "disease_name": "Rice Blast (Magnaporthe oryzae)",
        "prevention": [
            "Avoid excessive nitrogenous fertilizer application; balance with Potassium (K).",
            "Maintain optimum water level in paddy fields; avoid dry spells.",
            "Treat seeds with Carbendazim or Tricyclazole before sowing."
        ],
        "organic_treatment": [
            "Spray Pseudomonas fluorescens @ 10g/L or neem cake extract.",
            "Use vermiwash or bio-digester liquid to boost plant immunity."
        ],
        "chemical_control": [
            "Spray Tricyclazole 75% WP @ 0.6g/L or Isoprothiolane @ 1.5ml/L at initial symptom appearance."
        ]
    },
    "Wheat_Rust": {
        "disease_name": "Wheat Yellow / Brown Rust (Puccinia spp.)",
        "prevention": [
            "Grow rust-resistant cultivars recommended for your agro-climatic zone.",
            "Avoid late sowing to prevent favorable temperature windows for fungus spores.",
            "Regularly scout fields, especially during cool and humid mornings."
        ],
        "organic_treatment": [
            "Spray cow urine extract fermented with neem leaves.",
            "Use sulfur-based organic dusts early in the season."
        ],
        "chemical_control": [
            "Spray Propiconazole 25% EC (Tilt @ 1ml/L) or Tebuconazole upon first rust pustule detection."
        ]
    },
    "Corn_Common_Rust": {
        "disease_name": "Corn Common Rust (Puccinia sorghi)",
        "prevention": [
            "Select resistant maize hybrids.",
            "Maintain optimal plant spacing to promote airflow.",
            "Destroy crop residue after harvest."
        ],
        "organic_treatment": [
            "Foliar application of wettable sulfur.",
            "Spray neem seed kernel extract (NSKE 5%)."
        ],
        "chemical_control": [
            "Spray Mancozeb @ 2.5g/L or Azoxystrobin @ 1ml/L."
        ]
    },
    "Healthy": {
        "disease_name": "Healthy Plant (No Disease Detected)",
        "prevention": [
            "Continue following standard Integrated Pest Management (IPM) practices.",
            "Maintain balanced N-P-K fertilizer schedules based on periodic soil testing.",
            "Ensure regular irrigation scheduling tailored to crop growth stage."
        ],
        "organic_treatment": [
            "Routine maintenance: apply organic compost and bio-fertilizers periodically."
        ],
        "chemical_control": [
            "No chemical intervention needed."
        ]
    }
}


def get_disease_recommendations(disease_key: str) -> Dict[str, Any]:
    """
    Fetches actionable prevention and treatment recommendations for a given disease.

    Args:
        disease_key (str): The predicted disease identifier or class name.

    Returns:
        Dict[str, Any]: Dictionary containing disease name, prevention tips, organic treatments, and chemical control.
    """
    # Normalize key for lookup
    normalized_key = disease_key.strip().replace(" ", "_").replace("-", "_")

    if normalized_key in DISEASE_RECOMMENDATIONS:
        return DISEASE_RECOMMENDATIONS[normalized_key]

    # Flexible matching if exact key is not found
    for key, data in DISEASE_RECOMMENDATIONS.items():
        if key.lower() in normalized_key.lower() or normalized_key.lower() in key.lower():
            return data

    # Default fallback recommendations for unknown/custom classes
    return {
        "disease_name": disease_key,
        "prevention": [
            "Isolate infected leaves/plants to prevent spread to neighboring crops.",
            "Avoid overhead watering; irrigate directly at the root zone.",
            "Sterilize farming tools and shears with 70% alcohol between uses."
        ],
        "organic_treatment": [
            "Apply neem oil solution (5ml/L water with a few drops of mild soap).",
            "Spray bio-control agents like Trichoderma or Bacillus subtilis."
        ],
        "chemical_control": [
            "Consult local agricultural extension officer (Krishi Vigyan Kendra) with sample for verified fungicide advice."
        ]
    }

