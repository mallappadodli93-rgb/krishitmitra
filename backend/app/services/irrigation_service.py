"""
Smart Irrigation Recommendation Service for AgriSmart AI.
Implements transparent agro-hydrological rules combining soil moisture,
crop growth stage sensitivity, and 48-hour rainfall forecasts to eliminate
unnecessary water pumping and prevent crop moisture stress.
"""
import logging
from typing import Any, Dict, List, Optional, Tuple

from app.models.schemas import (
    CropStageSensitivityInfo,
    IrrigationRecommendationRequest,
    IrrigationRecommendationResponse,
    SoilMoistureInfo,
    WeatherImpactInfo,
)
from app.services.weather_service import fetch_weather_raw
from app.database.firebase import get_water_profile

logger = logging.getLogger("AgriSmartAI.IrrigationService")

# ==============================================================================
# SOIL HYDROLOGICAL BENCHMARKS (ICAR / FAO Soil Physics Standards)
# Field Capacity (FC) & Permanent Wilting Point (PWP) in volumetric %
# ==============================================================================
SOIL_HYDROLOGY = {
    "sandy loam": {
        "field_capacity": 18.0,
        "wilting_point": 8.0,
        "drainage": "Rapid infiltration, low moisture retention; requires frequent, light waterings.",
        "depth_factor": 1.2
    },
    "red soil": {
        "field_capacity": 24.0,
        "wilting_point": 12.0,
        "drainage": "Moderate to good permeability; balanced drainage.",
        "depth_factor": 1.5
    },
    "black soil": {
        "field_capacity": 38.0,
        "wilting_point": 20.0,
        "drainage": "High clay content, slow drainage, high water-holding capacity; sensitive to water stagnation.",
        "depth_factor": 1.8
    },
    "clayey": {
        "field_capacity": 35.0,
        "wilting_point": 18.0,
        "drainage": "Heavy texture, slow permeability; high water retention.",
        "depth_factor": 1.7
    },
    "laterite soil": {
        "field_capacity": 22.0,
        "wilting_point": 10.0,
        "drainage": "Porous, high permeability; moderate moisture retention.",
        "depth_factor": 1.4
    }
}

# Crop Growth Stage Water Demand Multipliers and Critical Windows
STAGE_PROFILES: Dict[str, Dict[str, Any]] = {
    "sowing": {
        "name": "Sowing / Seedling Establishment",
        "is_critical": False,
        "base_demand_mm": 3.0,
        "advisory": "Requires gentle, uniform surface moisture for seed imbibition. Avoid flood irrigation to prevent seed displacement or crusting."
    },
    "vegetative": {
        "name": "Vegetative Growth / Tillering",
        "is_critical": False,
        "base_demand_mm": 5.0,
        "advisory": "Active canopy expansion and leaf development. Irrigate when top 2-3 inches of soil feel dry to touch."
    },
    "flowering": {
        "name": "Flowering / Panicle Initiation / Silking",
        "is_critical": True,
        "base_demand_mm": 8.0,
        "advisory": "CRITICAL MOISTURE PERIOD: Moisture stress at flowering causes severe flower abortion, poor pollination, and permanent yield loss. Maintain steady root moisture."
    },
    "grain filling": {
        "name": "Grain Filling / Pod / Fruit Development",
        "is_critical": True,
        "base_demand_mm": 6.5,
        "advisory": "High water demand for starch and protein translocation into seeds/fruits. Avoid moisture deficit."
    },
    "maturity": {
        "name": "Maturity / Ripening",
        "is_critical": False,
        "base_demand_mm": 2.5,
        "advisory": "Gradually reduce irrigation to promote uniform ripening and increase grain/fruit sugar content."
    },
    "harvest": {
        "name": "Harvesting",
        "is_critical": False,
        "base_demand_mm": 0.0,
        "advisory": "Completely withhold irrigation 10-14 days before harvest to dry fields, prevent mold, and facilitate harvesting machinery."
    }
}

def resolve_soil_hydrology(soil_type: Optional[str]) -> Tuple[str, Dict[str, Any]]:
    """Matches user soil type to hydrological profile."""
    if not soil_type:
        return "Red Soil", SOIL_HYDROLOGY["red soil"]
    key = soil_type.strip().lower()
    for s_key, s_data in SOIL_HYDROLOGY.items():
        if s_key in key or key in s_key:
            return s_key.title(), s_data
    return soil_type.title(), SOIL_HYDROLOGY["red soil"]

def resolve_stage_profile(stage: Optional[str]) -> Tuple[str, Dict[str, Any]]:
    """Matches user stage string to known lifecycle stage profile."""
    if not stage:
        return "vegetative", STAGE_PROFILES["vegetative"]
    key = stage.strip().lower()
    for s_key, s_data in STAGE_PROFILES.items():
        if s_key in key or key in s_key:
            return s_key, s_data
    return "vegetative", STAGE_PROFILES["vegetative"]

def calculate_smart_irrigation_recommendation(
    request: IrrigationRecommendationRequest
) -> IrrigationRecommendationResponse:
    """
    Evaluates irrigation requirements using a multi-rule decision hierarchy:
    1. Rainfall Forecast Warning (Prevents water and electricity waste)
    2. Soil Moisture Measurement (Root zone status: dry, optimal, saturated)
    3. Crop Lifecycle Sensitivity (Critical flowering windows vs maturity cutoffs)
    4. Soil Texture Water Dynamics (Sand leaching vs Black soil waterlogging)
    """
    soil_name, soil_hydro = resolve_soil_hydrology(request.soil_type)
    stage_key, stage_info = resolve_stage_profile(request.crop_stage)

    # 1. Resolve 48-Hour Rainfall Forecast
    rain_forecast = 0.0
    weather_source = "User Provided"

    if request.rainfall_forecast_mm is not None:
        rain_forecast = float(request.rainfall_forecast_mm)
    elif request.latitude is not None and request.longitude is not None:
        try:
            raw_weather = fetch_weather_raw(request.latitude, request.longitude)
            daily = raw_weather.get("daily", {})
            daily_rain = daily.get("precipitation_sum", [])
            if daily_rain and len(daily_rain) >= 2:
                rain_forecast = float(daily_rain[0] + daily_rain[1])
                weather_source = "Live Open-Meteo 48h Forecast"
        except Exception as e:
            logger.warning(f"Could not fetch live weather for irrigation: {e}")
            rain_forecast = 0.0
            weather_source = "Fallback (0.0 mm assumed)"
    else:
        rain_forecast = 0.0
        weather_source = "None provided (0.0 mm assumed)"

    # Evaporation Risk based on temp & humidity
    temp = request.temperature_c if request.temperature_c is not None else 28.0
    hum = request.humidity_pct if request.humidity_pct is not None else 60.0
    if temp >= 34.0 or hum < 40.0:
        evap_risk = "HIGH"
    elif temp >= 26.0:
        evap_risk = "MODERATE"
    else:
        evap_risk = "LOW"

    # 2. Resolve Soil Moisture & Data Source Mode
    moisture = request.soil_moisture_pct
    if request.is_sensor_data:
        sensor_text = f"IoT Sensor Measured (Device: {request.sensor_id or 'In-situ electronic probe'})"
    elif moisture is not None:
        sensor_text = "Manually Entered / Qualitative Farmer Estimate"
    else:
        sensor_text = "Not Provided (Using Default Crop Growth & Weather Curve)"

    fc = soil_hydro["field_capacity"]
    pwp = soil_hydro["wilting_point"]

    if moisture is not None:
        if moisture >= (fc + 5.0):
            moisture_status = "SATURATED"
        elif moisture >= (pwp + 6.0):
            moisture_status = "OPTIMAL"
        else:
            moisture_status = "DRY / STRESSED"
    else:
        moisture_status = "ESTIMATED"

    # 3. Decision Logic Hierarchy
    # -------------------------------------------------------------
    # PRIORITY 1: Harvest / Maturity Cutoff Rule
    # -------------------------------------------------------------
    if stage_key in ("harvest", "maturity"):
        status_action = "SKIP_IRRIGATION"
        urgency = "NONE"
        reason = (
            f"{request.crop_name.title()} is in the {stage_info['name']} stage. "
            "Withhold irrigation to encourage natural dry-down, prevent fungal grain mold, and facilitate harvesting."
        )
        water_depth = 0.0
        depth_note = "0.0 mm required. Water cutoff active for ripening/harvest."

    # -------------------------------------------------------------
    # PRIORITY 2: Heavy Rainfall Forecast Warning
    # -------------------------------------------------------------
    elif rain_forecast >= 15.0:
        status_action = "SKIP_IRRIGATION"
        urgency = "NONE"
        reason = (
            f"Rain Warning: Substantial rainfall ({rain_forecast:.1f} mm) is forecasted in the next 24-48 hours. "
            "Do not irrigate. Skipping irrigation saves groundwater, motor pump electricity, and prevents root waterlogging."
        )
        water_depth = 0.0
        depth_note = f"0.0 mm required. Natural rainfall ({rain_forecast:.1f} mm) will fully replenish root zone."

    elif rain_forecast >= 7.0:
        status_action = "DELAY_IRRIGATION"
        urgency = "LOW"
        reason = (
            f"Rain Warning: Moderate showers ({rain_forecast:.1f} mm) are expected in the next 24-48 hours. "
            "Delay irrigation by 24 hours to observe actual rainfall before pumping."
        )
        water_depth = 0.0
        depth_note = f"Postponed. Monitor rain gauge; expected {rain_forecast:.1f} mm rain."

    # -------------------------------------------------------------
    # PRIORITY 3: Soil Moisture Sensor Readings
    # -------------------------------------------------------------
    elif moisture is not None:
        if moisture_status == "SATURATED":
            status_action = "DRAIN_EXCESS_WATER"
            urgency = "HIGH"
            reason = (
                f"Soil moisture is excessively high at {moisture:.1f}% (above field capacity of {fc:.1f}%). "
                "Risk of root suffocation and collar rot. Inspect and clear farm drainage trenches immediately."
            )
            water_depth = 0.0
            depth_note = "0.0 mm needed. Soil is saturated."
        elif moisture_status == "OPTIMAL":
            status_action = "SKIP_IRRIGATION"
            urgency = "LOW"
            reason = (
                f"Root zone moisture is currently balanced at {moisture:.1f}% (Field capacity: {fc:.1f}%). "
                f"Adequate moisture exists for {request.crop_name.title()} at {stage_info['name']}."
            )
            water_depth = 0.0
            depth_note = f"0.0 mm needed. Soil moisture ({moisture:.1f}%) is in optimal range ({pwp + 6.0:.1f}% - {fc:.1f}%)."
        else: # DRY / STRESSED
            status_action = "IRRIGATE_NOW"
            urgency = "HIGH" if stage_info["is_critical"] else "MODERATE"
            reason = (
                f"Soil moisture has dropped to {moisture:.1f}%, approaching permanent wilting point ({pwp:.1f}%). "
                f"Immediate irrigation is required to prevent moisture stress, especially during {stage_info['name']}."
            )
            # Calculate agronomic replenishment
            deficit_pct = max(0.0, fc - moisture)
            calc_depth = round(deficit_pct * soil_hydro["depth_factor"], 1)
            water_depth = max(15.0, min(50.0, calc_depth))
            depth_note = (
                f"Agronomic replenishment estimate: ~{water_depth:.1f} mm water needed to restore {soil_name} "
                f"from {moisture:.1f}% to field capacity ({fc:.1f}%)."
            )

    # -------------------------------------------------------------
    # PRIORITY 4: Stage & Climate Curve Fallback (Moisture not provided)
    # -------------------------------------------------------------
    else:
        if stage_info["is_critical"]:
            status_action = "IRRIGATE_NOW"
            urgency = "HIGH"
            reason = (
                f"{request.crop_name.title()} is in its most sensitive growth phase ({stage_info['name']}) "
                f"with negligible rain forecasted ({rain_forecast:.1f} mm). Provide timely irrigation to protect yield."
            )
        else:
            status_action = "DELAY_IRRIGATION"
            urgency = "MODERATE"
            reason = (
                f"Crop is in {stage_info['name']}. Without soil moisture sensor data, check topsoil moisture manually. "
                "If dry below 2 inches, provide light irrigation."
            )
        water_depth = None
        depth_note = (
            "Exact volumetric water depth not generated because soil moisture data was not provided. "
            "Enter soil moisture percentage or connect an IoT sensor probe for precise millimeter calculations."
        )

    # 4. Formulate Water Saving Suggestions
    water_saving_tips = [
        "Time irrigation during early morning (5:00 AM - 8:00 AM) or evening to reduce evaporative loss by up to 25%.",
        "Adopt drip irrigation or micro-sprinklers instead of flood irrigation to cut water consumption by 40-50%.",
        "Apply organic crop residue mulch (dry straw or leaves) around crop base to preserve soil moisture and suppress weeds."
    ]
    if rain_forecast >= 5.0:
        water_saving_tips.insert(0, f"Rain alert ({rain_forecast:.1f} mm): Switch off automated pump timers to conserve electricity and water.")

    # Check Linked Farmer Water Profile (Requirement 5)
    if request.farmer_id:
        p = get_water_profile(request.farmer_id)
        if p:
            sources = p.get("water_sources", [])
            has_dry = any(s.get("status") == "DRY" for s in sources)
            if has_dry or p.get("self_assessed_security", "").lower() in ("scarce", "critical"):
                water_saving_tips.insert(0, "CRITICAL FARM WATER ALERT: One or more registered water sources are dry. Implement strict deficit drip irrigation only.")

    # 5. Build Response
    weather_impact_obj = WeatherImpactInfo(
        forecasted_rainfall_next_48h_mm=round(rain_forecast, 1),
        rainfall_warning=f"Rain expected ({rain_forecast:.1f} mm). Irrigation not required." if rain_forecast >= 7.0 else None,
        evaporation_risk=evap_risk
    )

    soil_moisture_obj = SoilMoistureInfo(
        moisture_pct=round(moisture, 1) if moisture is not None else None,
        data_source_mode=sensor_text,
        soil_retention_capacity=soil_hydro["drainage"],
        moisture_stress_status=moisture_status
    )

    crop_stage_obj = CropStageSensitivityInfo(
        growth_stage=stage_info["name"],
        is_critical_water_period=stage_info["is_critical"],
        stage_advisory=stage_info["advisory"]
    )

    return IrrigationRecommendationResponse(
        irrigation_status=status_action,
        urgency=urgency,
        reason_for_recommendation=reason,
        weather_impact=weather_impact_obj,
        soil_moisture_information=soil_moisture_obj,
        crop_stage_sensitivity=crop_stage_obj,
        water_saving_suggestions=water_saving_tips,
        estimated_water_depth_mm=water_depth,
        quantity_estimation_note=depth_note,
        # Backward compatibility aliases
        action_required=status_action,
        recommended_water_mm=water_depth if water_depth is not None else 0.0,
        expected_rainfall_next_48h_mm=round(rain_forecast, 1),
        explanation=reason,
        energy_water_saving_tip=water_saving_tips[0]
    )

# Backward compatibility alias
def calculate_irrigation_advice(request: IrrigationRecommendationRequest):
    return calculate_smart_irrigation_recommendation(request)
