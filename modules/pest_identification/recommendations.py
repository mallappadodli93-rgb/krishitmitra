"""
Pest Management & Prevention Knowledge Base
Provides organic, biological, and chemical control recommendations for agricultural pests.
"""

from typing import Dict, Any

PEST_RECOMMENDATIONS: Dict[str, Dict[str, Any]] = {
    "Aphids": {
        "pest_name": "Aphids (Greenflies / Blackflies)",
        "damage_symptoms": "Curled leaves, sticky honeydew secretion, sooty mold growth, stunted plant development.",
        "prevention": [
            "Install yellow sticky traps across the field (15-20 traps per acre).",
            "Avoid excessive nitrogen fertilizers which promote soft succulent growth favored by aphids.",
            "Conserve natural predators such as ladybird beetles, lacewings, and hoverflies."
        ],
        "biological_control": [
            "Release Chrysoperla carnea (green lacewing) larvae @ 10,000/ha.",
            "Spray Verticillium lecanii bio-pesticide (5g/L)."
        ],
        "chemical_control": [
            "Spray Neem oil (3000 ppm) @ 3-5 ml/L water.",
            "For severe infestation, spray Imidacloprid 17.8% SL @ 0.5ml/L or Acetamiprid 20% SP @ 0.2g/L."
        ]
    },
    "Fall_Armyworm": {
        "pest_name": "Fall Armyworm (Spodoptera frugiperda)",
        "damage_symptoms": "Ragged holes in leaves, extensive defoliation, visible sawdust-like frass inside whorls.",
        "prevention": [
            "Synchronized community planting to avoid staggered infestations.",
            "Install pheromone traps @ 5 per acre to monitor adult moth populations.",
            "Deep summer ploughing to expose pupae to predatory birds and sun."
        ],
        "biological_control": [
            "Spray Bacillus thuringiensis (Bt) formulation @ 2g/L water in early instar stages.",
            "Release egg parasitoid Trichogramma pretiosum @ 50,000/acre."
        ],
        "chemical_control": [
            "Spray Chlorantraniliprole 18.5% SC @ 0.4 ml/L directly into leaf whorls.",
            "Apply Emamectin benzoate 5% SG @ 0.4 g/L."
        ]
    },
    "Whitefly": {
        "pest_name": "Whitefly (Bemisia tabaci)",
        "damage_symptoms": "Yellowing of leaves, leaf curl virus transmission, chlorosis, sticky foliage.",
        "prevention": [
            "Erect yellow sticky traps at crop canopy level.",
            "Grow border crops like maize, sorghum, or pearl millet as physical barriers.",
            "Regularly inspect the undersides of foliage."
        ],
        "biological_control": [
            "Apply Beauveria bassiana or Paecilomyces fumosoroseus @ 5g/L.",
            "Encourage predatory bugs (Macrolophus pygmaeus)."
        ],
        "chemical_control": [
            "Spray Diafenthiuron 50% WP @ 1g/L or Spiromesifen 22.9% SC @ 1ml/L."
        ]
    },
    "Stem_Borer": {
        "pest_name": "Stem Borer (Scirpophaga incertulas / Chilo partellus)",
        "damage_symptoms": "Dead hearts during vegetative stage and white heads / empty panicles at flowering stage.",
        "prevention": [
            "Clip seedling leaf tips before transplanting to remove egg masses.",
            "Avoid high plant density; ensure proper sunlight penetration.",
            "Collect and destroy stubble post-harvest."
        ],
        "biological_control": [
            "Release Trichogramma japonicum parasitoids @ 100,000/ha at weekly intervals.",
            "Use neem cake @ 150 kg/ha in the root zone."
        ],
        "chemical_control": [
            "Apply Cartap hydrochloride 4% G @ 10 kg/acre in standing water or spray Chlorantraniliprole 0.4% G."
        ]
    },
    "Spider_Mites": {
        "pest_name": "Two-Spotted Spider Mites (Tetranychus urticae)",
        "damage_symptoms": "Fine silken webbing under leaves, speckling/stippling, bronzing, and leaf drop.",
        "prevention": [
            "Avoid water stress and dry dusty conditions which accelerate mite reproduction.",
            "Maintain adequate relative humidity through overhead misting if possible."
        ],
        "biological_control": [
            "Introduce predatory mites such as Phytoseiulus persimilis.",
            "Spray neem oil formulation (5ml/L)."
        ],
        "chemical_control": [
            "Spray Propargite 57% EC @ 2ml/L or Fenpyroximate 5% EC @ 1ml/L."
        ]
    }
}


def get_pest_recommendations(pest_key: str) -> Dict[str, Any]:
    """
    Fetches prevention and control measures for an identified agricultural pest.

    Args:
        pest_key (str): Identified pest class label.

    Returns:
        Dict[str, Any]: Detailed management advice.
    """
    normalized_key = pest_key.strip().replace(" ", "_").replace("-", "_")

    if normalized_key in PEST_RECOMMENDATIONS:
        return PEST_RECOMMENDATIONS[normalized_key]

    for key, data in PEST_RECOMMENDATIONS.items():
        if key.lower() in normalized_key.lower() or normalized_key.lower() in key.lower():
            return data

    return {
        "pest_name": pest_key,
        "damage_symptoms": "Leaf damage, puncturing, or defoliation observed on crop.",
        "prevention": [
            "Regularly inspect crop foliage, especially the lower side of leaves.",
            "Maintain clean field borders and remove weed hosts.",
            "Install insect light and pheromone traps for pest monitoring."
        ],
        "biological_control": [
            "Spray botanical neem extract (5% NSKE) as an organic deterrent.",
            "Encourage natural beneficial predators like ladybugs and predatory mites."
        ],
        "chemical_control": [
            "Take a sample to the nearest Krishi Vigyan Kendra (KVK) or local agricultural officer for certified pesticide recommendations."
        ]
    }

