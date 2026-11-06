"""
Pydantic Schemas for Request Validation and Response Serialization.
Defines clean data contracts for all Member 3 features.
"""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict, AliasChoices

# ==========================================
# 0. Standard API Envelope
# ==========================================
class ApiResponse(BaseModel):
    """Standard API response wrapper."""
    success: bool = True
    message: str = "Success"
    data: Optional[Any] = None


# ==========================================
# 1. Weather Schemas
# ==========================================
class CoordinatesQuery(BaseModel):
    """GPS Coordinates for location-based weather queries."""
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude between -90 and 90")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude between -180 and 180")

class AgriculturalConditions(BaseModel):
    """Farm-specific insights derived from weather conditions."""
    spray_window_status: str = Field(..., description="SUITABLE, MARGINAL, or UNSUITABLE for pesticide/fertilizer spraying")
    spray_window_reason: str
    heat_stress_level: str = Field(..., description="NORMAL, CAUTION, or SEVERE")
    fungal_disease_risk: str = Field(..., description="LOW, MODERATE, or HIGH based on humidity and temp")
    evaporation_rate: str = Field(..., description="LOW, MODERATE, or HIGH water loss rate")

class CurrentWeatherResponse(BaseModel):
    """Current real-time weather details and agricultural insights."""
    latitude: float
    longitude: float
    timezone: str
    timestamp: str
    temperature_c: float
    apparent_temperature_c: float
    temp_min_today_c: float
    temp_max_today_c: float
    humidity_pct: float
    rainfall_mm: float
    wind_speed_kmh: float
    weather_code: int
    weather_condition: str
    agricultural_conditions: AgriculturalConditions

class DailyForecastItem(BaseModel):
    """Forecast details for a single calendar day."""
    date: str
    temp_max_c: float
    temp_min_c: float
    avg_temp_c: float
    precipitation_sum_mm: float
    precipitation_probability_max_pct: int
    max_wind_speed_kmh: float
    weather_code: int
    weather_condition: str
    farming_advisory: str

class ForecastAgriculturalSummary(BaseModel):
    """Pandas-aggregated 7-day agricultural forecast summary."""
    total_7day_rainfall_mm: float
    average_temp_c: float
    hottest_day: str
    max_temp_peak_c: float
    coldest_night: str
    min_temp_nadir_c: float
    rainiest_day: str
    rainiest_day_amount_mm: float
    irrigation_outlook: str
    overall_farming_outlook: str

class WeatherForecastResponse(BaseModel):
    """7-Day weather forecast with daily projections and statistical summary."""
    latitude: float
    longitude: float
    timezone: str
    daily_forecast: List[DailyForecastItem]
    agricultural_summary: ForecastAgriculturalSummary

class WeatherAlert(BaseModel):
    """Weather hazard alert with farming advisory."""
    alert_type: str = Field(..., description="e.g. Heavy Rainfall, Extreme Heat, Strong Wind, Frost")
    severity: str = Field(..., description="LOW, MODERATE, HIGH, CRITICAL")
    observed_value: str
    threshold_value: str
    message: str
    recommended_action: str

class WeatherAlertsResponse(BaseModel):
    """Active weather warnings for a specific location."""
    latitude: float
    longitude: float
    timestamp: str
    safety_status: str = Field(..., description="CLEAR, ADVISORY, or CRITICAL")
    active_alerts_count: int
    alerts: List[WeatherAlert]

# Backward compatibility alias
WeatherSummary = CurrentWeatherResponse


# ==========================================
# 2. Soil Health Schemas
# ==========================================
class SoilAnalysisRequest(BaseModel):
    """Soil test parameters input by farmer or IoT sensor."""
    model_config = ConfigDict(populate_by_name=True)

    ph: float = Field(..., ge=0.0, le=14.0, description="Soil pH level (0.0 to 14.0)")
    nitrogen: float = Field(
        ...,
        ge=0.0,
        validation_alias=AliasChoices("nitrogen", "nitrogen_n"),
        description="Available Nitrogen in kg/ha"
    )
    phosphorus: float = Field(
        ...,
        ge=0.0,
        validation_alias=AliasChoices("phosphorus", "phosphorus_p"),
        description="Available Phosphorus (P2O5) in kg/ha"
    )
    potassium: float = Field(
        ...,
        ge=0.0,
        validation_alias=AliasChoices("potassium", "potassium_k"),
        description="Available Potassium (K2O) in kg/ha"
    )
    soil_type: Optional[str] = Field(
        "Alluvial Soil",
        description="Soil type (e.g. Red Soil, Black Soil, Sandy Loam, Clayey, Laterite)"
    )
    soil_moisture_pct: Optional[float] = Field(
        None,
        ge=0.0,
        le=100.0,
        validation_alias=AliasChoices("soil_moisture_pct", "soil_moisture", "moisture_pct", "moisture"),
        description="Volumetric soil moisture percentage (0 to 100%)"
    )
    organic_carbon_pct: Optional[float] = Field(
        None,
        ge=0.0,
        le=100.0,
        validation_alias=AliasChoices("organic_carbon_pct", "organic_carbon"),
        description="Soil Organic Carbon percentage"
    )

class SoilNutrientStatus(BaseModel):
    """Status assessment for a single nutrient."""
    nutrient: str
    value: float
    unit: str = "kg/ha"
    level: str = Field(..., description="DEFICIENT / LOW, OPTIMAL / MEDIUM, EXCESS / HIGH")
    reference_range: str
    simple_explanation: str
    recommendation: str

class SoilPhAssessment(BaseModel):
    """pH classification and soil acidity/alkalinity assessment."""
    ph_value: float
    category: str
    status: str
    simple_explanation: str
    corrective_amendment: str

class SoilTypeInsight(BaseModel):
    """Agronomic characteristics of specific soil texture."""
    soil_type: str
    drainage_characteristics: str
    nutrient_holding_capacity: str
    special_consideration: str
    moisture_status: Optional[str] = None

class SoilHealthReport(BaseModel):
    """Complete soil health analysis report with simple explanations and disclaimers."""
    ph_category: str = Field(..., description="Classification (e.g. Slightly Acidic, Neutral, Alkaline)")
    overall_health_score: float = Field(..., ge=0, le=100, description="Health score out of 100")
    health_rating: str = Field(..., description="EXCELLENT, GOOD, FAIR, or POOR")
    summary_verdict: str
    ph_assessment: SoilPhAssessment
    nutrient_analysis: List[SoilNutrientStatus]
    soil_type_insight: SoilTypeInsight
    actionable_recommendations: List[str]
    general_recommendations: List[str] = []
    reference_source: str = "ICAR (Indian Council of Agricultural Research) & FAO Soil Quality Guidelines"
    disclaimer: str = (
        "Disclaimer: This advisory is an agronomic screening tool based on entered values and standard regional benchmarks. "
        "It does not substitute for certified wet-chemistry laboratory soil test reports. "
        "Consult local agricultural extension officers (e.g. KVK) before making major chemical fertilizer purchases."
    )


# ==========================================
# 3. Crop Recommendation Schemas
# ==========================================
class CropRecommendationRequest(BaseModel):
    """Input parameters for location-based crop recommendation."""
    model_config = ConfigDict(populate_by_name=True)

    latitude: float = Field(..., ge=-90.0, le=90.0, description="Farmer latitude")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Farmer longitude")
    district: Optional[str] = Field(None, description="District (e.g. Mysuru, Mandya, Dharwad, Kolar)")
    state: Optional[str] = Field("Karnataka", description="State (e.g. Karnataka)")
    
    soil_type: Optional[str] = Field(None, description="e.g. Red Soil, Black Soil, Sandy Loam, Clayey, Laterite")
    soil_ph: Optional[float] = Field(
        None,
        ge=0.0,
        le=14.0,
        validation_alias=AliasChoices("soil_ph", "ph"),
        description="Soil pH (0.0 to 14.0)"
    )
    nitrogen: Optional[float] = Field(
        None,
        ge=0.0,
        validation_alias=AliasChoices("nitrogen", "nitrogen_n"),
        description="Available Nitrogen in kg/ha"
    )
    phosphorus: Optional[float] = Field(
        None,
        ge=0.0,
        validation_alias=AliasChoices("phosphorus", "phosphorus_p"),
        description="Available Phosphorus in kg/ha"
    )
    potassium: Optional[float] = Field(
        None,
        ge=0.0,
        validation_alias=AliasChoices("potassium", "potassium_k"),
        description="Available Potassium in kg/ha"
    )

    rainfall_mm: Optional[float] = Field(None, ge=0.0, description="Annual/seasonal precipitation in mm")
    temperature_c: Optional[float] = Field(None, description="Average seasonal temperature in °C")
    water_availability: Optional[str] = Field(
        "Moderate / Borewell",
        description="Water availability (e.g. 'Abundant / Canal', 'Moderate / Borewell', 'Rainfed / Limited')"
    )
    season: Optional[str] = Field("Kharif", description="Target Season: Kharif, Rabi, Zaid, or All-Season")

    # Optional embedded soil object for backward compatibility
    soil: Optional[SoilAnalysisRequest] = None

class RequiredSoilConditions(BaseModel):
    """Ideal soil environment for a specific crop."""
    ideal_ph_range: str
    preferred_soil_types: List[str]
    drainage_need: str

class CropWaterRequirements(BaseModel):
    """Hydrological profile of a specific crop."""
    water_demand_level: str
    seasonal_rainfall_range_mm: str
    irrigation_guidance: str

class RecommendedCrop(BaseModel):
    """Recommended primary crop with detailed agronomic justification."""
    crop_name: str
    suitability_score: float = Field(..., ge=0, le=100)
    suitability_category: str = Field(..., description="Highly Suitable, Moderately Suitable, or Conditionally Suitable")
    suitable_growing_season: str
    expected_growth_duration_days: int
    required_soil_conditions: RequiredSoilConditions
    water_requirements: CropWaterRequirements
    reasons_for_recommendation: List[str]
    # Backward compatibility fields
    ideal_temperature_range: Optional[str] = None
    ideal_rainfall_range: Optional[str] = None
    reason: Optional[str] = None

class AlternativeCrop(BaseModel):
    """Secondary or contingency crop option."""
    crop_name: str
    suitability_score: float
    suitability_category: str
    suitable_growing_season: str
    quick_rationale: str

class LocationContext(BaseModel):
    """Normalized agricultural context evaluated for this farm."""
    latitude: float
    longitude: float
    district: Optional[str] = None
    state: Optional[str] = None
    effective_season: str
    effective_water_availability: str
    effective_soil_type: str
    effective_ph: float
    climate_source: str

class CropRecommendationResponse(BaseModel):
    """Comprehensive crop suitability report."""
    location: Optional[CoordinatesQuery] = None
    location_context: LocationContext
    scoring_model_reference: str
    recommended_crops: List[RecommendedCrop]
    alternative_crops: List[AlternativeCrop]
    agricultural_disclaimer: str

    @property
    def recommendations(self) -> List[RecommendedCrop]:
        """Backward compatibility alias for recommended_crops."""
        return self.recommended_crops


# ==========================================
# 4. Smart Irrigation Schemas
# ==========================================
class IrrigationRecommendationRequest(BaseModel):
    """Parameters to evaluate smart irrigation necessity."""
    model_config = ConfigDict(populate_by_name=True)

    crop_name: str = Field(..., description="Target Crop (e.g. Rice, Maize, Cotton, Ragi, Tomato, Sugarcane)")
    crop_stage: Optional[str] = Field(
        "Vegetative",
        description="Growth Stage: Sowing, Vegetative, Flowering / Panicle, Grain Filling, Maturity, Harvest"
    )
    soil_type: Optional[str] = Field("Red Soil", description="Soil Type: Red Soil, Black Soil, Sandy Loam, Clayey")
    soil_moisture_pct: Optional[float] = Field(
        None,
        ge=0.0,
        le=100.0,
        validation_alias=AliasChoices("soil_moisture_pct", "soil_moisture", "moisture_pct", "moisture"),
        description="Volumetric soil moisture percentage (0 - 100%)"
    )
    is_sensor_data: Optional[bool] = Field(
        False,
        description="True if measured by an electronic IoT sensor; False if estimated or manually entered"
    )
    sensor_id: Optional[str] = Field(None, description="Optional hardware sensor identifier")
    rainfall_forecast_mm: Optional[float] = Field(
        None,
        ge=0.0,
        description="Expected rainfall over the next 24 to 48 hours (mm)"
    )
    farmer_id: Optional[str] = Field(None, description="Optional Farmer ID to automatically link registered water profile")
    water_availability: Optional[str] = Field(
        "Moderate / Borewell",
        description="Farm water source: Abundant / Canal, Moderate / Borewell, Rainfed / Limited"
    )
    temperature_c: Optional[float] = Field(None, description="Prevailing temperature in °C")
    humidity_pct: Optional[float] = Field(None, ge=0.0, le=100.0, description="Relative humidity %")
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0, description="Farm Latitude for live weather fallback")
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0, description="Farm Longitude for live weather fallback")

# Backward compatibility alias
IrrigationAdviceRequest = IrrigationRecommendationRequest

class WeatherImpactInfo(BaseModel):
    """Weather and rainfall forecast influence on irrigation."""
    forecasted_rainfall_next_48h_mm: float
    rainfall_warning: Optional[str] = None
    evaporation_risk: str = Field(..., description="HIGH, MODERATE, or LOW")

class SoilMoistureInfo(BaseModel):
    """Soil moisture assessment distinguishing sensor vs manual data."""
    moisture_pct: Optional[float] = None
    data_source_mode: str = Field(..., description="IoT Sensor Measured vs Manually Entered / Estimated vs Not Provided")
    soil_retention_capacity: str
    moisture_stress_status: str = Field(..., description="DRY / STRESSED, OPTIMAL, SATURATED, or ESTIMATED")

class CropStageSensitivityInfo(BaseModel):
    """Stage-specific water demand details."""
    growth_stage: str
    is_critical_water_period: bool
    stage_advisory: str

class IrrigationRecommendationResponse(BaseModel):
    """Complete decision output for smart irrigation."""
    irrigation_status: str = Field(..., description="IRRIGATE_NOW, DELAY_IRRIGATION, SKIP_IRRIGATION, or DRAIN_EXCESS_WATER")
    urgency: str = Field(..., description="HIGH, MODERATE, LOW, or NONE")
    reason_for_recommendation: str
    weather_impact: WeatherImpactInfo
    soil_moisture_information: SoilMoistureInfo
    crop_stage_sensitivity: CropStageSensitivityInfo
    water_saving_suggestions: List[str]
    estimated_water_depth_mm: Optional[float] = Field(None, description="Replenishment depth in mm (only provided when sufficient data exists)")
    quantity_estimation_note: str

    # Backward compatibility aliases
    action_required: str
    recommended_water_mm: float
    expected_rainfall_next_48h_mm: float
    explanation: str
    energy_water_saving_tip: str

# Backward compatibility alias
IrrigationAdviceResponse = IrrigationRecommendationResponse


# ==========================================
# 5. Crop Calendar Schemas
# ==========================================
class GenerateCropCalendarRequest(BaseModel):
    """Request crop timeline and stage-wise schedule."""
    crop_name: str = Field(..., description="Crop (e.g. Maize, Paddy, Ragi, Cotton, Sugarcane)")
    sowing_date: Optional[str] = Field(None, description="Sowing date in YYYY-MM-DD format (defaults to today)")
    variety: Optional[str] = Field(None, description="Crop variety (e.g. 'GPU-28' for Ragi, 'Jaya' for Paddy, 'Deccan-103' for Maize)")
    season: Optional[str] = Field("Kharif", description="Growing season: Kharif, Rabi, Summer / Zaid")
    district: Optional[str] = Field(None, description="District (e.g. Mysuru, Mandya, Dharwad)")
    state: Optional[str] = Field("Karnataka", description="State (e.g. Karnataka)")
    farmer_id: Optional[str] = Field("FARMER-DEFAULT", description="Farmer Identifier to link calendar")

CropCalendarRequest = GenerateCropCalendarRequest

class GrowthStageDetail(BaseModel):
    """Detailed stage of a crop's lifecycle with timeline dates and advisories."""
    stage_name: str
    day_start: int
    day_end: int
    duration_days: int
    estimated_start_date: str
    estimated_end_date: str
    is_date_estimated: bool = True
    water_need: str
    irrigation_reminder: str
    monitoring_reminder: str
    fertilizer_guidance: str
    critical_activities: List[str]

GrowthStage = GrowthStageDetail

class CropCalendarGeneratedResponse(BaseModel):
    """Complete crop lifecycle calendar with stage-specific advisories."""
    calendar_id: str
    farmer_id: str
    crop_name: str
    variety: str
    season: str
    location: str
    sowing_date: str
    total_duration_days: int
    estimated_harvest_window: str
    date_estimation_disclaimer: str = (
        "Note: Calendar dates are agronomic projections based on regional temperature baselines and normal development. "
        "Actual crop duration may vary by +/- 5 to 7 days depending on seasonal heat units and field microclimates."
    )
    stages: List[GrowthStageDetail]

CropCalendarResponse = CropCalendarGeneratedResponse


# ==========================================
# 6. Location & Farm Data Schemas (Firebase)
# ==========================================
class FarmProfileCreate(BaseModel):
    """Create or update farmer and farm information."""
    model_config = ConfigDict(populate_by_name=True)

    farmer_name: str = Field(..., validation_alias=AliasChoices("farmer_name", "name", "farmerName"))
    phone: Optional[str] = None
    farm_name: Optional[str] = "My Farm"
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = "Karnataka"
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    area_acres: Optional[float] = Field(1.0, validation_alias=AliasChoices("area_acres", "farm_size_acres", "acres"))
    soil_type: Optional[str] = None
    primary_crops: List[str] = []

    def model_dump(self, *args, **kwargs):
        d = super().model_dump(*args, **kwargs)
        # Ensure 'name' and 'farm_size_acres' are present alongside farmer_name and area_acres
        d["name"] = self.farmer_name
        d["farm_size_acres"] = self.area_acres
        return d

class FarmProfileResponse(FarmProfileCreate):
    """Stored farm profile with assigned ID."""
    id: str
    created_at: str


# ==========================================
# 7. Water Availability Schemas
# ==========================================
class WaterSourceItem(BaseModel):
    """Specification of an individual water resource."""
    source_type: str = Field(..., description="borewell, well, pond, canal, rainwater_storage")
    status: str = Field("ACTIVE", description="ACTIVE, SEASONAL, DRY, LIMITED")
    daily_capacity_liters: Optional[float] = Field(None, ge=0.0, description="Available daily discharge (liters)")
    storage_capacity_liters: Optional[float] = Field(None, ge=0.0, description="Storage reservoir volume (liters)")
    operating_hours_per_day: Optional[float] = Field(None, ge=0.0, le=24.0, description="Daily pumping hours")
    notes: Optional[str] = None

class WaterProfileRegisterRequest(BaseModel):
    """Register farmer water sources and storage assets."""
    farmer_id: str = Field(..., description="Unique farmer identification")
    farm_name: Optional[str] = "My Farm"
    water_sources: List[WaterSourceItem] = Field(..., min_length=1, description="List of water sources on farm")
    primary_source: Optional[str] = Field(None, description="Primary water source")
    total_farm_acres: Optional[float] = Field(2.0, ge=0.05, description="Cultivated farm area in acres")
    has_drip_irrigation: Optional[bool] = False
    has_sprinkler_irrigation: Optional[bool] = False
    self_assessed_security: Optional[str] = Field("Moderate", description="Abundant, Moderate, Scarce / Critical")

class WaterProfileUpdateRequest(BaseModel):
    """Update water availability or source status."""
    farm_name: Optional[str] = None
    water_sources: Optional[List[WaterSourceItem]] = None
    primary_source: Optional[str] = None
    total_farm_acres: Optional[float] = Field(None, ge=0.05)
    has_drip_irrigation: Optional[bool] = None
    has_sprinkler_irrigation: Optional[bool] = None
    self_assessed_security: Optional[str] = None

class WaterDashboardResponse(BaseModel):
    """Farmer dashboard view of farm water security and conservation recommendations."""
    farmer_id: str
    farm_name: str
    registered_sources_count: int
    water_sources: List[WaterSourceItem]
    overall_water_security: str = Field(..., description="ABUNDANT, ADEQUATE, VULNERABLE, or CRITICAL_SHORTAGE")
    shortage_warning: Optional[str] = None
    daily_estimated_availability_liters: Optional[float] = None
    total_storage_capacity_liters: Optional[float] = None
    irrigation_feasibility: str
    recommended_irrigation_method: str
    water_conservation_methods: List[str]
    last_updated: str
    data_provenance_note: str = "Based strictly on farmer-reported water sources and verified capacities."

class WaterAvailabilityResponse(BaseModel):
    """Regional macro-water status (location-based fallback)."""
    latitude: float
    longitude: float
    water_stress_index: str = Field(..., description="LOW, MODERATE, HIGH, EXTREME")
    rainfall_deficit_percentage: float
    groundwater_status: str
    conservation_advisory: str
