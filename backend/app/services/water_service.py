"""
Water Availability Management Service for AgriSmart AI.
Stores and evaluates farm water assets (borewell, well, pond, canal, rainwater storage).
Computes farm water security index, generates shortage alerts, and tailors water conservation strategies.
"""
from datetime import datetime
import logging
from typing import Any, Dict, List, Optional, Tuple

from app.database.firebase import (
    get_water_profile,
    save_water_profile,
    update_water_profile,
)
from app.models.schemas import (
    WaterDashboardResponse,
    WaterProfileRegisterRequest,
    WaterProfileUpdateRequest,
    WaterSourceItem,
)

logger = logging.getLogger("AgriSmartAI.WaterService")

VALID_WATER_SOURCES = {"borewell", "well", "pond", "canal", "rainwater_storage"}

def validate_sources(sources: List[WaterSourceItem]):
    """Validates that all reported sources belong to supported farm water types."""
    for s in sources:
        cleaned = s.source_type.strip().lower()
        if cleaned not in VALID_WATER_SOURCES:
            raise ValueError(
                f"Unsupported water source '{s.source_type}'. "
                f"Allowed sources: {', '.join(sorted(VALID_WATER_SOURCES))}."
            )

def compute_water_analytics(profile_data: Dict[str, Any]) -> Tuple[str, Optional[str], Optional[float], Optional[float], str, str, List[str]]:
    """
    Computes overall water security status, shortage warnings,
    and conservation methods based on user-provided assets.
    """
    sources_raw = profile_data.get("water_sources", [])
    acres = float(profile_data.get("total_farm_acres", 2.0))
    has_drip = bool(profile_data.get("has_drip_irrigation", False))
    self_assess = profile_data.get("self_assessed_security", "Moderate").lower()

    total_daily_liters = 0.0
    total_storage_liters = 0.0
    has_active_source = False
    dry_sources_count = 0

    source_types_present = set()

    for s in sources_raw:
        stype = s.get("source_type", "").lower()
        status = s.get("status", "ACTIVE").upper()
        daily = s.get("daily_capacity_liters")
        storage = s.get("storage_capacity_liters")
        hours = s.get("operating_hours_per_day")

        source_types_present.add(stype)

        if status == "ACTIVE":
            has_active_source = True
            if daily:
                total_daily_liters += float(daily)
            elif hours and stype in ("borewell", "well"):
                # Standard 1.5 to 2 inch borewell yields ~5,000 to 7,000 L/hour
                total_daily_liters += float(hours) * 5500.0
        elif status == "DRY":
            dry_sources_count += 1

        if storage:
            total_storage_liters += float(storage)

    # 1. Determine Water Security Status & Shortage Warnings
    shortage_warning = None
    if not has_active_source or (sources_raw and dry_sources_count == len(sources_raw)) or "scarce" in self_assess or "critical" in self_assess:
        security_status = "CRITICAL_SHORTAGE"
        shortage_warning = (
            "CRITICAL WATER SHORTAGE ALERT: All or primary water sources are reported dry or severely restricted. "
            "Available reserves cannot sustain normal watering. Immediately implement extreme deficit irrigation, "
            "apply thick organic mulching, and suspend any fresh sowing."
        )
        feasibility = "Severely constrained. Insufficient for standard crop evapotranspiration."
        rec_method = "Strict Drip Fertigation & Tree Basal Drenching Only"
    elif total_daily_liters > 0 and (total_daily_liters / max(0.5, acres)) < 8000.0:
        security_status = "VULNERABLE"
        shortage_warning = (
            f"Water Vulnerability Advisory: Available daily water (~{total_daily_liters:,.0f} L) is low for {acres} acres. "
            "Prioritize irrigation only for crops at critical flowering/fruiting stages."
        )
        feasibility = "Marginal. Suitable only with micro-irrigation systems."
        rec_method = "Drip or Micro-Sprinkler Irrigation Required"
    elif "canal" in source_types_present or total_daily_liters >= (20000.0 * acres) or "abundant" in self_assess:
        security_status = "ABUNDANT"
        feasibility = "High. Ample water available for seasonal and perennial cultivation."
        rec_method = "Drip or Managed Furrow Irrigation"
    else:
        security_status = "ADEQUATE"
        feasibility = "Adequate for planned cropping cycles under good farm water management."
        rec_method = "Drip Irrigation Recommended for maximum efficiency"

    # 2. Formulate Tailored Water Conservation Methods
    conservation_methods: List[str] = []

    if not has_drip:
        conservation_methods.append(
            "Install Pressurized Drip Irrigation: PMKSY (Per Drop More Crop) provides 70% to 90% government subsidy in Karnataka, saving 45-60% water."
        )

    if "borewell" in source_types_present:
        conservation_methods.append(
            "Borewell Artificial Recharge: Construct a rainwater percolation pit/filter around the borewell casing to divert clean monsoon runoff and replenish deep aquifers."
        )

    if "pond" in source_types_present:
        conservation_methods.append(
            "Farm Pond (Krishi Honda) Seepage Control: Line the pond bed with 500-micron UV-stabilized geomembrane/polythene to eliminate 70% seepage loss."
        )

    if "canal" in source_types_present:
        conservation_methods.append(
            "Canal Turn Storage: Divert assigned rotational canal water into on-farm lining ponds to avoid relying on irregular canal discharge schedules."
        )

    if "rainwater_storage" in source_types_present:
        conservation_methods.append(
            "Catchment Cleaning: Service roof and apron sand-gravel filters before monsoon showers to keep stored tank water sediment-free."
        )

    conservation_methods.append(
        "Organic Mulching: Spread 3-4 inches of dry paddy straw or sugarcane trash along crop beds to reduce surface evaporation by up to 35%."
    )
    conservation_methods.append(
        "Nighttime Irrigation: Operate pumps between 7:00 PM and 6:00 AM to eliminate wind drift and daytime evaporative loss while taking advantage of off-peak electricity."
    )

    daily_est = round(total_daily_liters, 1) if total_daily_liters > 0 else None
    storage_est = round(total_storage_liters, 1) if total_storage_liters > 0 else None

    return security_status, shortage_warning, daily_est, storage_est, feasibility, rec_method, conservation_methods

def register_farmer_water_profile(request: WaterProfileRegisterRequest) -> WaterDashboardResponse:
    """Registers and stores water sources for a farmer."""
    validate_sources(request.water_sources)

    data = request.model_dump()
    save_water_profile(request.farmer_id, data)

    return get_farmer_water_dashboard(request.farmer_id)

def get_farmer_water_dashboard(farmer_id: str) -> WaterDashboardResponse:
    """Retrieves farmer water profile and computes real-time water security dashboard metrics."""
    profile = get_water_profile(farmer_id)
    if not profile:
        raise ValueError(f"No water profile found for farmer ID '{farmer_id}'. Please register water assets first.")

    sec_status, warning, daily_l, store_l, feas, rec_method, tips = compute_water_analytics(profile)

    sources_objects = [WaterSourceItem(**s) for s in profile.get("water_sources", [])]

    return WaterDashboardResponse(
        farmer_id=farmer_id,
        farm_name=profile.get("farm_name", "My Farm"),
        registered_sources_count=len(sources_objects),
        water_sources=sources_objects,
        overall_water_security=sec_status,
        shortage_warning=warning,
        daily_estimated_availability_liters=daily_l,
        total_storage_capacity_liters=store_l,
        irrigation_feasibility=feas,
        recommended_irrigation_method=rec_method,
        water_conservation_methods=tips,
        last_updated=profile.get("last_updated", datetime.utcnow().isoformat())
    )

def update_farmer_water_profile_service(
    farmer_id: str,
    updates: WaterProfileUpdateRequest
) -> WaterDashboardResponse:
    """Updates water assets (e.g. after seasonal borewell recharge or farm pond depletion)."""
    update_dict = {k: v for k, v in updates.model_dump().items() if v is not None}
    if "water_sources" in update_dict and update_dict["water_sources"]:
        validate_sources([WaterSourceItem(**s) for s in update_dict["water_sources"]])

    updated = update_water_profile(farmer_id, update_dict)
    if not updated:
        raise ValueError(f"Farmer ID '{farmer_id}' does not exist. Cannot update.")

    return get_farmer_water_dashboard(farmer_id)

