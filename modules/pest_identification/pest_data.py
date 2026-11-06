"""
AgriSmart AI - Agricultural Pest Knowledge Base
Provides detailed agronomic data, affected crops, damage symptoms,
and Integrated Pest Management (IPM) guidelines for agricultural pests.
"""

from typing import Dict, Any, List

PEST_KNOWLEDGE_BASE: Dict[str, Dict[str, Any]] = {
    "Aphids": {
        "display_name": "Aphids (Greenflies / Blackflies)",
        "scientific_name": "Aphis gossypii / Myzus persicae",
        "affected_crops": [
            "Cotton", "Wheat", "Mustard", "Tomato", "Potato", "Chili", "Cabbage", "Okra"
        ],
        "damage_symptoms": (
            "Yellowing, curling, and crinkling of tender young leaves. Secretion of sticky "
            "honeydew that leads to black sooty mold growth, inhibiting photosynthesis. Vectors viral diseases."
        ),
        "threat_level": "High (Rapid Reproduction)",
        "economic_threshold": "10% of plants showing active colonies",
        "biological_control": [
            "Conserve and introduce Coccinellid predators (Ladybird beetles).",
            "Spray bio-fungicide Verticillium lecanii @ 5g/L during humid weather.",
            "Release Chrysoperla carnea (Green lacewing) larvae @ 10,000/ha."
        ],
        "organic_remedies": [
            "Spray cold-pressed Neem Seed Kernel Extract (NSKE 5%) or Neem oil (3000 ppm) @ 4-5 ml/L.",
            "Foliar spray of soap-water solution (10g mild soap / liter) as a desiccant."
        ],
        "chemical_control": [
            "Imidacloprid 17.8% SL @ 0.5 ml/L water (use protective gloves and mask).",
            "Acetamiprid 20% SP @ 0.2 g/L during peak infestation."
        ]
    },
    "Fall_Armyworm": {
        "display_name": "Fall Armyworm",
        "scientific_name": "Spodoptera frugiperda",
        "affected_crops": [
            "Maize (Corn)", "Sorghum", "Rice", "Sugarcane", "Cotton", "Millets"
        ],
        "damage_symptoms": (
            "Elongated papery feeding patches (windows) on leaves in early stages; severe ragged holes, defoliation, "
            "and visible sawdust-like fecal pellets (frass) inside central leaf whorls."
        ),
        "threat_level": "Critical (Severe Yield Devastation)",
        "economic_threshold": "5-10% damaged plants during whorl stage",
        "biological_control": [
            "Release egg parasitoid Trichogramma pretiosum @ 50,000 per acre.",
            "Apply microbial insecticide Bacillus thuringiensis (Bt) kurstaki formulation @ 2g/L.",
            "Spray Metarhizium anisopliae or Beauveria bassiana @ 5g/L."
        ],
        "organic_remedies": [
            "Apply dry sand mixed with neem seed powder directly into whorls to kill early-stage larvae.",
            "Install pheromone traps @ 5-8 traps/acre for adult moth monitoring."
        ],
        "chemical_control": [
            "Chlorantraniliprole 18.5% SC @ 0.4 ml/L directed into central leaf whorls.",
            "Emamectin benzoate 5% SG @ 0.4 g/L for moderate to advanced larval stages."
        ]
    },
    "Whitefly": {
        "display_name": "Whitefly",
        "scientific_name": "Bemisia tabaci",
        "affected_crops": [
            "Cotton", "Tomato", "Chili", "Tobacco", "Brinjal (Eggplant)", "Okra", "Soybean"
        ],
        "damage_symptoms": (
            "Chlorosis and yellow spotting on leaf surfaces. Major vector for destructive viral diseases "
            "such as Tomato Leaf Curl Virus (ToLCV) and Cotton Leaf Curl Virus (CLCuV)."
        ),
        "threat_level": "Critical (Vector of Geminiviruses)",
        "economic_threshold": "6-8 adults per leaf",
        "biological_control": [
            "Encourage parasitic wasps (Encarsia formosa).",
            "Spray entomopathogenic fungi Paecilomyces fumosoroseus @ 5g/L."
        ],
        "organic_remedies": [
            "Erect yellow sticky cards at canopy height (15-20 traps/acre).",
            "Grow border barrier crops of maize, sorghum, or pearl millet (4 rows around the field)."
        ],
        "chemical_control": [
            "Diafenthiuron 50% WP @ 1.2 g/L or Spiromesifen 22.9% SC @ 1 ml/L.",
            "Pyriproxyfen 10% EC @ 1.5 ml/L (insect growth regulator)."
        ]
    },
    "Stem_Borer": {
        "display_name": "Stem Borer (Yellow / Spotted)",
        "scientific_name": "Scirpophaga incertulas / Chilo partellus",
        "affected_crops": [
            "Rice (Paddy)", "Maize", "Sugarcane", "Sorghum", "Wheat"
        ],
        "damage_symptoms": (
            "Larvae bore into plant stems, destroying the vascular cylinder. Causes 'Dead Heart' in the vegetative stage "
            "(central shoot withers and pulls out easily) and 'White Head' (empty, erect white panicles) at heading."
        ),
        "threat_level": "High (Direct Panicle Loss)",
        "economic_threshold": "1 egg mass per square meter or 5% dead hearts",
        "biological_control": [
            "Release egg parasitoid Trichogramma japonicum @ 100,000/ha at 7-day intervals.",
            "Conserve field spiders and dragonflies."
        ],
        "organic_remedies": [
            "Clip seedling leaf tips before transplanting paddy to eliminate egg batches.",
            "Install light traps @ 1 per acre to attract and destroy adult moths."
        ],
        "chemical_control": [
            "Cartap hydrochloride 4% G @ 10 kg/acre broadcasted in standing water (2-3 cm).",
            "Chlorantraniliprole 0.4% G @ 4 kg/acre."
        ]
    },
    "Spider_Mites": {
        "display_name": "Two-Spotted Spider Mites",
        "scientific_name": "Tetranychus urticae",
        "affected_crops": [
            "Tomato", "Brinjal (Eggplant)", "Cucumber", "Cotton", "Strawberry", "Capsicum"
        ],
        "damage_symptoms": (
            "Fine white-to-yellow speckling (stippling) on upper leaf surfaces; dense silken webbing on leaf undersides. "
            "Leaves turn bronzed, dry, and drop prematurely in hot, dry weather."
        ),
        "threat_level": "Moderate to High (Flourishes in drought)",
        "economic_threshold": "Webbing visible on more than 15% of sampled leaves",
        "biological_control": [
            "Introduce predatory mites (Phytoseiulus persimilis or Neoseiulus californicus).",
            "Spray neem oil 3000 ppm formulation @ 5 ml/L."
        ],
        "organic_remedies": [
            "Avoid excessive water stress; overhead sprinkler irrigation deters mite reproduction.",
            "Wash foliage with fine high-pressure water spray during early morning."
        ],
        "chemical_control": [
            "Propargite 57% EC @ 2 ml/L or Fenpyroximate 5% EC @ 1 ml/L.",
            "Spiromesifen 22.9% SC @ 0.8 ml/L."
        ]
    },
    "Bollworm": {
        "display_name": "Helicoverpa / American Bollworm",
        "scientific_name": "Helicoverpa armigera",
        "affected_crops": [
            "Cotton", "Tomato", "Chickpea (Gram)", "Pigeon pea", "Corn", "Chili"
        ],
        "damage_symptoms": (
            "Larvae bore round holes into cotton squares/bolls, tomato fruits, and legume pods. "
            "Caterpillars feed with their front half inside the fruit and rear half outside."
        ),
        "threat_level": "Critical (Direct Fruit/Boll Damage)",
        "economic_threshold": "1 larva per meter row or 5% damaged fruiting bodies",
        "biological_control": [
            "Spray Helicoverpa NPV (HaNPV) viral formulation @ 250 LE/ha in evening hours.",
            "Release Trichogramma chilonis egg parasitoids @ 50,000/ha."
        ],
        "organic_remedies": [
            "Plant marigold (Tagetes erecta) as a trap crop around tomato/cotton plots (1:16 ratio).",
            "Pheromone traps (Helilure) @ 5 traps per acre."
        ],
        "chemical_control": [
            "Spinosad 45% SC @ 0.3 ml/L or Indoxacarb 14.5% SC @ 1 ml/L.",
            "Chlorantraniliprole 18.5% SC @ 0.3 ml/L."
        ]
    },
    "Thrips": {
        "display_name": "Thrips (Chili / Onion Thrips)",
        "scientific_name": "Scirtothrips dorsalis / Thrips tabaci",
        "affected_crops": [
            "Chili", "Onion", "Garlic", "Cotton", "Groundnut", "Tomato"
        ],
        "damage_symptoms": (
            "Silvery streaks or bronzing on leaves and petals. Upward curling of chili leaves ('boat-shaped leaves'). "
            "Stunted growth, fruit scarring, and transmission of Groundnut Bud Necrosis Virus."
        ),
        "threat_level": "High (Distorts growing tips)",
        "economic_threshold": "2-3 thrips per leaf",
        "biological_control": [
            "Release predatory bugs like Orius insidiosus (Minute pirate bug).",
            "Spray Lecanicillium lecanii bio-insecticide @ 5g/L."
        ],
        "organic_remedies": [
            "Install blue sticky traps (thrips are strongly attracted to blue color) @ 15/acre.",
            "Neem oil spray (10,000 ppm) @ 2 ml/L."
        ],
        "chemical_control": [
            "Fipronil 5% SC @ 1.5 ml/L or Spinetoram 11.7% SC @ 1 ml/L."
        ]
    },
    "Beneficial_Or_Healthy": {
        "display_name": "Beneficial Insect or Healthy Plant",
        "scientific_name": "Beneficial Agronomic Organism",
        "affected_crops": [
            "All Agricultural Crops"
        ],
        "damage_symptoms": "No crop damage. Insect observed is beneficial (e.g. Ladybug, Hoverfly, Lacewing, Pollinator Bee, Spider) which preys on pests.",
        "threat_level": "None (Beneficial)",
        "economic_threshold": "N/A",
        "biological_control": [
            "Protect and conserve natural predator populations; avoid unnecessary broad-spectrum chemical sprays."
        ],
        "organic_remedies": [
            "Plant flowering border plants (sunflower, coriander, fennel) to provide nectar for adult beneficial predators."
        ],
        "chemical_control": [
            "No chemical intervention needed. Chemical sprays harm beneficial insects."
        ]
    }
}


def get_pest_info(pest_key: str) -> Dict[str, Any]:
    """
    Retrieves complete pest profile, affected crops, damage symptoms, and IPM recommendations.
    """
    clean_key = pest_key.strip().replace(" ", "_").replace("-", "_")
    if clean_key in PEST_KNOWLEDGE_BASE:
        return PEST_KNOWLEDGE_BASE[clean_key]

    for key, data in PEST_KNOWLEDGE_BASE.items():
        if key.lower() in clean_key.lower() or clean_key.lower() in key.lower():
            return data

    return {
        "display_name": pest_key,
        "scientific_name": "Unspecified Agricultural Arthropod",
        "affected_crops": ["Field crops, horticulture, and vegetables"],
        "damage_symptoms": "Leaf puncturing, sap extraction, or tissue defoliation.",
        "threat_level": "Unassessed",
        "economic_threshold": "Monitor regularly",
        "biological_control": ["Encourage natural beneficial predators like ladybugs and predatory mites."],
        "organic_remedies": ["Apply organic cold-pressed neem seed oil (3000 ppm @ 5ml/L)."],
        "chemical_control": ["Consult local agricultural officer (KVK) with insect specimen before applying pesticides."]
    }

