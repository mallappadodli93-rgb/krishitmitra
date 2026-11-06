"""
Smart Crop Calendar Service for AgriSmart AI.
Generates stage-by-stage crop timelines, stage-specific irrigation reminders,
and monitoring advisories calibrated to specific crop varieties and regional seasons.
"""
from datetime import date, datetime, timedelta
import logging
from typing import Any, Dict, List, Optional
import uuid

from app.database.firebase import save_crop_calendar, get_crop_calendars_by_farmer
from app.models.schemas import (
    CropCalendarGeneratedResponse,
    GenerateCropCalendarRequest,
    GrowthStageDetail,
)

logger = logging.getLogger("AgriSmartAI.CalendarService")

# ==============================================================================
# CROP LIFECYCLE DATABASE (ICAR & UAS Bangalore / Dharwad)
# Differentiated stage definitions per crop and variety duration
# ==============================================================================
CROP_LIFECYCLE_TEMPLATES: Dict[str, Dict[str, Any]] = {
    "maize": {
        "crop_name": "Maize (Corn)",
        "default_variety": "Medium Duration Hybrid (Deccan-103 / CP-818)",
        "duration_days": 105,
        "stages": [
            {
                "stage_name": "Sowing & Seedling Emergence",
                "day_start": 1,
                "day_end": 12,
                "water_need": "Light to Moderate",
                "irrigation_reminder": "Keep seed zone moist for uniform emergence; avoid standing water to prevent seed rotting.",
                "monitoring_reminder": "Scout for cutworms and early Fall Armyworm (FAW) egg clusters on tender leaf undersides.",
                "fertilizer_guidance": "Apply full basal Phosphorus, Potassium, and 1/3rd Nitrogen dose at furrow sowing.",
                "critical_activities": ["Seed treatment with Trichoderma / Thiamethoxam", "Line sowing with 60x20 cm spacing", "Ensure light initial irrigation"]
            },
            {
                "stage_name": "Knee-High / Rapid Vegetative Growth",
                "day_start": 13,
                "day_end": 40,
                "water_need": "Moderate",
                "irrigation_reminder": "Irrigate when top 2-3 inches feel dry. Avoid moisture stress as leaf area is expanding.",
                "monitoring_reminder": "Scout closely for Fall Armyworm central whorl damage. Apply recommended pheromone traps or bio-pesticides (Metarhizium) if needed.",
                "fertilizer_guidance": "Top-dress 1/3rd Nitrogen dose at 30 days after sowing followed by earthing-up.",
                "critical_activities": ["Inter-cultivation with blade harrow", "Hand weeding at 20-25 DAS", "Earthing-up along crop rows to support root anchorage"]
            },
            {
                "stage_name": "Tasseling & Silking (Critical Period)",
                "day_start": 41,
                "day_end": 70,
                "water_need": "Critical Peak Requirement",
                "irrigation_reminder": "MOST CRITICAL IRRIGATION STAGE: Moisture stress during pollination causes poor silk emergence and blank cobs.",
                "monitoring_reminder": "Ensure adequate soil moisture during midday pollen shedding. Scout for cob borer entry.",
                "fertilizer_guidance": "Top-dress remaining 1/3rd Nitrogen dose at tasseling stage just prior to irrigation.",
                "critical_activities": ["Ensure continuous root zone moisture", "Avoid pesticide sprays during active morning bee pollination (8-11 AM)", "Monitor stem borer larvae"]
            },
            {
                "stage_name": "Grain Filling & Milk / Dough Stage",
                "day_start": 71,
                "day_end": 92,
                "water_need": "Moderate",
                "irrigation_reminder": "Maintain adequate moisture to ensure full grain filling and heavy cob weight.",
                "monitoring_reminder": "Inspect cobs for fungal ear rot or bird attack. Install reflective ribbons if necessary.",
                "fertilizer_guidance": "No further soil chemical fertilizer needed. Optional 1% Potassium nitrate foliar spray if deficient.",
                "critical_activities": ["Maintain intermittent light irrigation", "Deter avian and wild animal intrusion", "Drain water if unseasonal storm occurs"]
            },
            {
                "stage_name": "Maturity & Harvesting",
                "day_start": 93,
                "day_end": 105,
                "water_need": "None (Withhold Water)",
                "irrigation_reminder": "Completely cut off irrigation 10-12 days before harvest to facilitate cob drying and reduce moisture.",
                "monitoring_reminder": "Check for black layer formation at kernel attachment point, signaling physiological maturity.",
                "fertilizer_guidance": "None.",
                "critical_activities": ["Harvest when husk covers turn dry and straw-colored", "De-husk and sun-dry cobs to 12% moisture", "Shell and store in clean bags"]
            }
        ]
    },
    "paddy": {
        "crop_name": "Rice (Paddy)",
        "default_variety": "Medium Duration (Jaya / IR-64 / MTU-1010)",
        "duration_days": 130,
        "stages": [
            {
                "stage_name": "Nursery Raising & Seedling Establishment",
                "day_start": 1,
                "day_end": 25,
                "water_need": "Shallow water / Saturated",
                "irrigation_reminder": "Maintain shallow water layer (1-2 cm) in nursery bed. Drain excess during heavy rainfall.",
                "monitoring_reminder": "Check for thrips in nursery and seedling damping-off.",
                "fertilizer_guidance": "Apply DAP in nursery bed; basal Zinc Sulfate application in main puddle field.",
                "critical_activities": ["Seed sprouting and raised bed nursery prep", "Field puddling and leveling", "Transplanting 2-3 seedlings per hill at 25 days"]
            },
            {
                "stage_name": "Active Tillering & Canopy Development",
                "day_start": 26,
                "day_end": 60,
                "water_need": "High (2-5 cm Standing Water)",
                "irrigation_reminder": "Maintain 2-5 cm standing water layer. Intermittent drying (alternate wetting and drying) can save 25% water.",
                "monitoring_reminder": "Scout for yellow stem borer (dead hearts) and leaf folder larvae. Set up pheromone traps.",
                "fertilizer_guidance": "Apply 1st top dressing of Nitrogen (Urea) at active tillering (20-25 days after transplanting).",
                "critical_activities": ["Cono-weeder operation at 20 and 40 DAT", "Maintain water level", "Gap filling within 7 days of transplanting"]
            },
            {
                "stage_name": "Panicle Initiation & Booting (Critical Period)",
                "day_start": 61,
                "day_end": 85,
                "water_need": "Critical Peak Moisture",
                "irrigation_reminder": "CRITICAL WATER STAGE: Do not allow field to dry. Moisture deficit at panicle formation causes high sterility.",
                "monitoring_reminder": "Inspect for neck blast, bacterial leaf blight (BLB), and brown planthopper (BPH) at base of tillers.",
                "fertilizer_guidance": "Apply 2nd top dressing of Nitrogen and full Murate of Potash (MOP) at panicle initiation.",
                "critical_activities": ["Maintain continuous 5 cm standing water", "Scout tiller bases for BPH", "Foliar disease inspection"]
            },
            {
                "stage_name": "Flowering & Grain Filling (Milky / Dough Stage)",
                "day_start": 86,
                "day_end": 110,
                "water_need": "Moderate to High",
                "irrigation_reminder": "Maintain shallow water or saturated soil until dough stage is reached.",
                "monitoring_reminder": "Check for gundhi bug (rice bug) during milk stage; spray neem oil if sweet milk odor attracts bugs.",
                "fertilizer_guidance": "No soil fertilizer. Optional foliar spray of 1% DAP if grain filling is sluggish.",
                "critical_activities": ["Control gundhi bugs in early morning hours", "Prevent standing water stagnating for too long"]
            },
            {
                "stage_name": "Grain Hardening & Harvesting",
                "day_start": 111,
                "day_end": 130,
                "water_need": "None (Drain Field)",
                "irrigation_reminder": "Completely drain out all water 10-14 days before harvest to hasten ripening and allow combine harvesters.",
                "monitoring_reminder": "Harvest when 85% of grains in panicles turn golden brown and moisture is ~20%.",
                "fertilizer_guidance": "None.",
                "critical_activities": ["Drain all field water channels", "Harvest with sickle or combine harvester", "Thresh and dry grain to 12-14% storage moisture"]
            }
        ]
    },
    "ragi": {
        "crop_name": "Ragi (Finger Millet)",
        "default_variety": "High-Yielding Karnataka Variety (GPU-28 / Indaf-9 / ML-365)",
        "duration_days": 115,
        "stages": [
            {
                "stage_name": "Sowing / Nursery & Seedling Emergence",
                "day_start": 1,
                "day_end": 20,
                "water_need": "Low to Moderate",
                "irrigation_reminder": "Ensure light, uniform moisture for seed emergence. If rainfed, sow immediately following pre-monsoon showers.",
                "monitoring_reminder": "Check for uniform germination and flea beetle holes on young cotyledons.",
                "fertilizer_guidance": "Apply 50% Nitrogen and 100% Phosphorus and Potash at time of sowing / main field preparation.",
                "critical_activities": ["Seed treatment with Azospirillum biofertilizer", "Nursery or direct line sowing (30x10 cm)", "Pre-emergence weed control"]
            },
            {
                "stage_name": "Vegetative Growth & Active Tillering",
                "day_start": 21,
                "day_end": 50,
                "water_need": "Moderate",
                "irrigation_reminder": "Ragi has excellent drought tolerance. Provide 1 protective irrigation if rain fails for more than 12 days.",
                "monitoring_reminder": "Inspect for leaf blast lesions (diamond-shaped spindle spots). Treat with bio-control if spots spread.",
                "fertilizer_guidance": "Top-dress remaining 50% Nitrogen (Urea) at 25-30 days after sowing just after weeding.",
                "critical_activities": ["Inter-cultivation with 'kunte' (blade harrow) at 20 and 35 DAS", "Hand weeding along rows", "Thinning to maintain optimum plant population"]
            },
            {
                "stage_name": "Earhead Emergence & Flowering (Critical Period)",
                "day_start": 51,
                "day_end": 75,
                "water_need": "Critical Water Stage",
                "irrigation_reminder": "CRITICAL WATER PERIOD: Provide protective irrigation if monsoon dry spell occurs during finger opening and flowering.",
                "monitoring_reminder": "Scout for neck blast and finger blast. Spray Tricyclazole or Pseudomonas fluorescens if blast occurs.",
                "fertilizer_guidance": "None needed if basal application was adequate.",
                "critical_activities": ["Protective irrigation if rain is absent", "Monitor neck blast in humid cloudy weather", "Inter-row mulching"]
            },
            {
                "stage_name": "Grain Filling & Dough Stage",
                "day_start": 76,
                "day_end": 95,
                "water_need": "Low",
                "irrigation_reminder": "Relies largely on residual soil moisture. Avoid excess moisture which can lodge tall ragi plants.",
                "monitoring_reminder": "Protect earheads against bird predation during early morning and late evening.",
                "fertilizer_guidance": "None.",
                "critical_activities": ["Bird scaring using bio-repellents or ribbons", "Maintain clear drainage in case of late rains"]
            },
            {
                "stage_name": "Maturation & Earhead Harvesting",
                "day_start": 96,
                "day_end": 115,
                "water_need": "None",
                "irrigation_reminder": "Withhold all irrigation. Allow earheads to dry naturally on the stalk.",
                "monitoring_reminder": "Check earheads: when fingers turn dry chocolate brown, crop is ready for harvest.",
                "fertilizer_guidance": "None.",
                "critical_activities": ["Harvest earheads using hand sickles", "Sun-dry earheads on threshing floor for 3-4 days", "Thresh, winnow, and store grain below 12% moisture"]
            }
        ]
    }
}

def resolve_crop_template(crop_name: str) -> Dict[str, Any]:
    """Retrieves specific crop growth profile or constructs a resilient agronomic profile."""
    key = crop_name.strip().lower()
    for t_key, t_data in CROP_LIFECYCLE_TEMPLATES.items():
        if t_key in key or key in t_key or ("rice" in key and t_key == "paddy") or ("corn" in key and t_key == "maize"):
            return t_data

    # Default generalized 110-day template for other crops
    return {
        "crop_name": crop_name.title(),
        "default_variety": "Standard Regional Variety",
        "duration_days": 110,
        "stages": [
            {
                "stage_name": "Sowing & Germination",
                "day_start": 1,
                "day_end": 15,
                "water_need": "Moderate",
                "irrigation_reminder": "Ensure adequate seedbed moisture for uniform germination.",
                "monitoring_reminder": "Scout for soil-borne pathogens and uniform seedling emergence.",
                "fertilizer_guidance": "Apply basal NPK fertilization.",
                "critical_activities": ["Land preparation", "Seed treatment", "Sowing"]
            },
            {
                "stage_name": "Vegetative Growth",
                "day_start": 16,
                "day_end": 50,
                "water_need": "Moderate to High",
                "irrigation_reminder": "Irrigate according to soil moisture depletion.",
                "monitoring_reminder": "Monitor weeds and early vegetative insect pests.",
                "fertilizer_guidance": "Top-dress nitrogen.",
                "critical_activities": ["Weeding", "Inter-cultivation", "Pest scouting"]
            },
            {
                "stage_name": "Flowering & Reproductive Phase",
                "day_start": 51,
                "day_end": 80,
                "water_need": "Critical Peak Moisture",
                "irrigation_reminder": "Maintain adequate moisture; avoid water stress during flowering.",
                "monitoring_reminder": "Scout for floral pests and foliar diseases.",
                "fertilizer_guidance": "Apply potassium / foliar nutrients if recommended.",
                "critical_activities": ["Protective irrigation", "Disease inspection"]
            },
            {
                "stage_name": "Maturation & Harvest",
                "day_start": 81,
                "day_end": 110,
                "water_need": "Low to None",
                "irrigation_reminder": "Withhold irrigation 10 days before harvest.",
                "monitoring_reminder": "Monitor crop drying and harvest readiness.",
                "fertilizer_guidance": "None.",
                "critical_activities": ["Harvesting", "Drying", "Storage"]
            }
        ]
    }

def generate_crop_calendar_service(
    request: GenerateCropCalendarRequest
) -> CropCalendarGeneratedResponse:
    """
    Generates a crop growth calendar with estimated stage dates,
    irrigation reminders, and monitoring activities.
    """
    # 1. Parse Sowing Date
    if request.sowing_date:
        try:
            sow_date = datetime.strptime(request.sowing_date.strip(), "%Y-%m-%d").date()
        except ValueError:
            logger.warning(f"Invalid sowing date format: {request.sowing_date}. Defaulting to today.")
            sow_date = date.today()
    else:
        sow_date = date.today()

    template = resolve_crop_template(request.crop_name)
    var_name = request.variety or template.get("default_variety", "Standard Variety")
    loc_str = f"{request.district or 'Regional'}, {request.state or 'Karnataka'}"

    # 2. Build Stage Details with Estimated Calendar Dates
    stage_details: List[GrowthStageDetail] = []
    for stg in template["stages"]:
        d_start = stg["day_start"]
        d_end = stg["day_end"]
        duration = d_end - d_start + 1

        est_start = sow_date + timedelta(days=d_start - 1)
        est_end = sow_date + timedelta(days=d_end - 1)

        stage_details.append(GrowthStageDetail(
            stage_name=stg["stage_name"],
            day_start=d_start,
            day_end=d_end,
            duration_days=duration,
            estimated_start_date=est_start.isoformat(),
            estimated_end_date=est_end.isoformat(),
            is_date_estimated=True,
            water_need=stg["water_need"],
            irrigation_reminder=stg["irrigation_reminder"],
            monitoring_reminder=stg["monitoring_reminder"],
            fertilizer_guidance=stg["fertilizer_guidance"],
            critical_activities=stg["critical_activities"]
        ))

    # 3. Overall Harvest Window
    total_days = template["duration_days"]
    harvest_start_date = sow_date + timedelta(days=stage_details[-1].day_start - 1)
    harvest_end_date = sow_date + timedelta(days=total_days - 1)
    harvest_str = f"{harvest_start_date.isoformat()} to {harvest_end_date.isoformat()} (Estimated)"

    cal_id = f"CAL-{str(uuid.uuid4())[:8].upper()}"
    farmer_id = request.farmer_id or "FARMER-DEFAULT"

    response = CropCalendarGeneratedResponse(
        calendar_id=cal_id,
        farmer_id=farmer_id,
        crop_name=template["crop_name"],
        variety=var_name,
        season=request.season or "Kharif",
        location=loc_str,
        sowing_date=sow_date.isoformat(),
        total_duration_days=total_days,
        estimated_harvest_window=harvest_str,
        stages=stage_details
    )

    # 4. Save to persistent storage (Firebase / mock fallback)
    try:
        save_crop_calendar(farmer_id, response.model_dump())
    except Exception as e:
        logger.error(f"Error persisting calendar: {e}")

    return response

def get_farmer_calendars_service(farmer_id_or_crop: str) -> List[Dict[str, Any]]:
    """
    Retrieves saved calendars for a farmer ID, or dynamically builds one
    if farmer_id_or_crop matches a known crop name.
    """
    saved = get_crop_calendars_by_farmer(farmer_id_or_crop)
    if saved:
        return saved

    # Fallback: check if the string matches a known crop name
    clean_key = farmer_id_or_crop.strip().lower()
    is_known_crop = any(
        t_key in clean_key or clean_key in t_key
        for t_key in CROP_LIFECYCLE_TEMPLATES.keys()
    ) or clean_key in ("rice", "corn", "millet", "finger millet")

    if is_known_crop:
        test_req = GenerateCropCalendarRequest(crop_name=farmer_id_or_crop, farmer_id=farmer_id_or_crop)
        dynamic_cal = generate_crop_calendar_service(test_req)
        return [dynamic_cal.model_dump()]

    return []

