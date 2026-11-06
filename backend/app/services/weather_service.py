"""
Weather Forecasting & Agriculture Intelligence Service.
Integrates with Open-Meteo API, processes forecasts with Pandas,
and generates rule-based farming weather alerts.
"""
import logging
from typing import Any, Dict, List
import pandas as pd
import requests

from app.config import settings
from app.models.schemas import (
    AgriculturalConditions,
    CurrentWeatherResponse,
    DailyForecastItem,
    ForecastAgriculturalSummary,
    WeatherAlert,
    WeatherAlertsResponse,
    WeatherForecastResponse,
)

logger = logging.getLogger("AgriSmartAI.WeatherService")

# WMO Weather Interpretation Codes (WMO Code -> Friendly Description)
WMO_WEATHER_CODES: Dict[int, str] = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
}

def decode_weather_condition(code: int) -> str:
    """Translates WMO weather code into farmer-readable condition."""
    return WMO_WEATHER_CODES.get(code, f"Weather code {code}")

def fetch_weather_raw(latitude: float, longitude: float) -> Dict[str, Any]:
    """
    Fetches live forecast and current observations from Open-Meteo.
    Raises RuntimeError if external API is unreachable or returns an error.
    Never invents or fakes weather data.
    """
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "precipitation",
            "weather_code",
            "wind_speed_10m"
        ],
        "daily": [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_sum",
            "precipitation_probability_max",
            "wind_speed_10m_max"
        ],
        "timezone": "auto"
    }

    try:
        response = requests.get(
            settings.OPEN_METEO_BASE_URL,
            params=params,
            timeout=settings.WEATHER_REQUEST_TIMEOUT_SECONDS
        )
        response.raise_for_status()
        data = response.json()
        if "current" not in data or "daily" not in data:
            raise ValueError("Malformed response received from Open-Meteo.")
        return data
    except requests.exceptions.Timeout:
        logger.error(f"Weather API timed out after {settings.WEATHER_REQUEST_TIMEOUT_SECONDS}s.")
        raise RuntimeError("Weather service timed out while connecting to Open-Meteo. Please try again shortly.")
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to communicate with Open-Meteo: {e}")
        raise RuntimeError(f"External weather service unavailable: {str(e)}")

def analyze_agricultural_conditions(
    temp: float,
    humidity: float,
    wind_speed: float,
    rain: float
) -> AgriculturalConditions:
    """
    Computes actionable farming condition metrics:
    - Spray window (ideal pesticide/fertilizer spraying)
    - Heat stress on crops
    - Fungal infection risk
    - Evaporation rate
    """
    # 1. Spray window suitability
    if rain > 0.1:
        spray_status = "UNSUITABLE"
        spray_reason = "Active rainfall will wash away sprayed chemicals."
    elif wind_speed > 20.0:
        spray_status = "UNSUITABLE"
        spray_reason = f"High wind speed ({wind_speed} km/h) causes excessive droplet drift."
    elif wind_speed > 12.0:
        spray_status = "MARGINAL"
        spray_reason = "Moderate breeze; spray only with drift-reducing nozzles."
    else:
        spray_status = "SUITABLE"
        spray_reason = "Calm winds and dry conditions are optimal for foliar application."

    # 2. Crop heat stress
    if temp >= 38.0:
        heat_stress = "SEVERE"
    elif temp >= 33.0:
        heat_stress = "CAUTION"
    else:
        heat_stress = "NORMAL"

    # 3. Fungal risk
    if humidity >= 80.0 and 20.0 <= temp <= 32.0:
        fungal_risk = "HIGH"
    elif humidity >= 65.0:
        fungal_risk = "MODERATE"
    else:
        fungal_risk = "LOW"

    # 4. Evaporation rate
    if temp >= 32.0 and wind_speed >= 15.0:
        evap = "HIGH"
    elif temp >= 24.0:
        evap = "MODERATE"
    else:
        evap = "LOW"

    return AgriculturalConditions(
        spray_window_status=spray_status,
        spray_window_reason=spray_reason,
        heat_stress_level=heat_stress,
        fungal_disease_risk=fungal_risk,
        evaporation_rate=evap,
    )

def get_current_weather_service(latitude: float, longitude: float) -> CurrentWeatherResponse:
    """
    Retrieves current weather conditions with agricultural insights.
    """
    raw_data = fetch_weather_raw(latitude, longitude)
    current = raw_data["current"]
    daily = raw_data["daily"]

    temp = float(current.get("temperature_2m", 0.0))
    hum = float(current.get("relative_humidity_2m", 0.0))
    rain = float(current.get("precipitation", 0.0))
    wind = float(current.get("wind_speed_10m", 0.0))
    code = int(current.get("weather_code", 0))
    apparent_temp = float(current.get("apparent_temperature", temp))

    # Today's min/max from first entry of daily forecast
    min_temp_today = float(daily.get("temperature_2m_min", [temp])[0])
    max_temp_today = float(daily.get("temperature_2m_max", [temp])[0])

    agri_conditions = analyze_agricultural_conditions(temp, hum, wind, rain)

    return CurrentWeatherResponse(
        latitude=raw_data.get("latitude", latitude),
        longitude=raw_data.get("longitude", longitude),
        timezone=raw_data.get("timezone", "UTC"),
        timestamp=current.get("time", ""),
        temperature_c=temp,
        apparent_temperature_c=apparent_temp,
        temp_min_today_c=min_temp_today,
        temp_max_today_c=max_temp_today,
        humidity_pct=hum,
        rainfall_mm=rain,
        wind_speed_kmh=wind,
        weather_code=code,
        weather_condition=decode_weather_condition(code),
        agricultural_conditions=agri_conditions,
    )

def get_7day_forecast_service(latitude: float, longitude: float) -> WeatherForecastResponse:
    """
    Computes 7-day daily forecast and uses Pandas for trend analysis and agricultural summaries.
    """
    raw_data = fetch_weather_raw(latitude, longitude)
    daily = raw_data["daily"]

    # Build Pandas DataFrame for clean data processing and aggregation
    df = pd.DataFrame({
        "date": daily["time"],
        "temp_max": daily["temperature_2m_max"],
        "temp_min": daily["temperature_2m_min"],
        "precipitation_sum": daily["precipitation_sum"],
        "precip_prob_max": daily.get("precipitation_probability_max", [0] * len(daily["time"])),
        "wind_speed_max": daily["wind_speed_10m_max"],
        "weather_code": daily["weather_code"]
    })

    # Calculate average daily temperature
    df["avg_temp"] = (df["temp_max"] + df["temp_min"]) / 2.0

    # Summary statistics with Pandas
    total_rainfall = float(df["precipitation_sum"].sum())
    mean_temp = float(df["avg_temp"].mean())

    rainiest_row = df.loc[df["precipitation_sum"].idxmax()]
    hottest_row = df.loc[df["temp_max"].idxmax()]
    coldest_row = df.loc[df["temp_min"].idxmin()]

    # Irrigation outlook
    if total_rainfall > 40.0:
        irrigation_outlook = "Abundant rainfall expected. Reduce or suspend scheduled irrigation."
    elif total_rainfall > 15.0:
        irrigation_outlook = "Moderate rainfall predicted. Delay irrigation until after rain events."
    else:
        irrigation_outlook = "Dry week anticipated. Adhere strictly to irrigation schedules to avoid moisture deficit."

    # General farming outlook
    if total_rainfall > 50.0:
        overall_outlook = "Heavy weekly rainfall. Maintain field drainage channels to prevent waterlogging."
    elif hottest_row["temp_max"] >= 38.0:
        overall_outlook = "High temperatures expected. Water crops during cooler morning or evening hours."
    else:
        overall_outlook = "Favorable weather for vegetative growth and routine fieldwork."

    summary = ForecastAgriculturalSummary(
        total_7day_rainfall_mm=round(total_rainfall, 1),
        average_temp_c=round(mean_temp, 1),
        hottest_day=str(hottest_row["date"]),
        max_temp_peak_c=round(float(hottest_row["temp_max"]), 1),
        coldest_night=str(coldest_row["date"]),
        min_temp_nadir_c=round(float(coldest_row["temp_min"]), 1),
        rainiest_day=str(rainiest_row["date"]),
        rainiest_day_amount_mm=round(float(rainiest_row["precipitation_sum"]), 1),
        irrigation_outlook=irrigation_outlook,
        overall_farming_outlook=overall_outlook
    )

    # Convert rows to DailyForecastItem objects
    daily_items: List[DailyForecastItem] = []
    for _, row in df.iterrows():
        # Generate day-specific advisory
        p_sum = float(row["precipitation_sum"])
        w_max = float(row["wind_speed_max"])
        t_max = float(row["temp_max"])

        if p_sum >= 20.0:
            adv = "High precipitation expected. Pause chemical spraying and fertilizing."
        elif w_max >= 25.0:
            adv = "Gusty winds forecasted. Avoid foliar spraying; brace young trees/trellises."
        elif t_max >= 36.0:
            adv = "Intense heat. Protect delicate crops and ensure adequate soil moisture."
        elif p_sum > 0.0:
            adv = "Light showers probable. Beneficial for soil moisture."
        else:
            adv = "Clear/dry day. Excellent window for weeding, tilling, or chemical application."

        daily_items.append(DailyForecastItem(
            date=str(row["date"]),
            temp_max_c=round(float(row["temp_max"]), 1),
            temp_min_c=round(float(row["temp_min"]), 1),
            avg_temp_c=round(float(row["avg_temp"]), 1),
            precipitation_sum_mm=round(p_sum, 1),
            precipitation_probability_max_pct=int(row["precip_prob_max"]),
            max_wind_speed_kmh=round(w_max, 1),
            weather_code=int(row["weather_code"]),
            weather_condition=decode_weather_condition(int(row["weather_code"])),
            farming_advisory=adv
        ))

    return WeatherForecastResponse(
        latitude=raw_data.get("latitude", latitude),
        longitude=raw_data.get("longitude", longitude),
        timezone=raw_data.get("timezone", "UTC"),
        daily_forecast=daily_items,
        agricultural_summary=summary
    )

def get_weather_alerts_service(latitude: float, longitude: float) -> WeatherAlertsResponse:
    """
    Evaluates current and upcoming weather against configurable agricultural thresholds.
    Generates alerts for heavy rainfall, extreme heat, strong winds, and frost.
    """
    raw_data = fetch_weather_raw(latitude, longitude)
    current = raw_data["current"]
    daily = raw_data["daily"]

    current_temp = float(current.get("temperature_2m", 0.0))
    current_rain = float(current.get("precipitation", 0.0))
    current_wind = float(current.get("wind_speed_10m", 0.0))
    current_hum = float(current.get("relative_humidity_2m", 0.0))

    alerts: List[WeatherAlert] = []

    # 1. Extreme Heat Alert (Current or Today's Forecast)
    max_today = float(daily.get("temperature_2m_max", [current_temp])[0])
    peak_heat = max(current_temp, max_today)
    if peak_heat >= settings.ALERT_EXTREME_HEAT_C:
        alerts.append(WeatherAlert(
            alert_type="Extreme Heat Warning",
            severity="CRITICAL" if peak_heat >= 42.0 else "HIGH",
            observed_value=f"{peak_heat:.1f}°C",
            threshold_value=f">={settings.ALERT_EXTREME_HEAT_C:.1f}°C",
            message=f"Severe heat hazard: Temperatures reaching {peak_heat:.1f}°C.",
            recommended_action="Provide light evening irrigation to cool roots. Avoid midday transplanting and foliar treatments."
        ))

    # 2. Frost Alert
    min_today = float(daily.get("temperature_2m_min", [current_temp])[0])
    if min_today <= settings.ALERT_FROST_C:
        alerts.append(WeatherAlert(
            alert_type="Frost Hazard Warning",
            severity="HIGH",
            observed_value=f"{min_today:.1f}°C",
            threshold_value=f"<={settings.ALERT_FROST_C:.1f}°C",
            message=f"Sub-zero or near-freezing overnight temperature expected ({min_today:.1f}°C).",
            recommended_action="Apply micro-sprinkler or flood irrigation before dawn to raise ground temperature and shield tender shoots."
        ))

    # 3. Heavy Rainfall Alert (Current or 24h sum)
    daily_rain_today = float(daily.get("precipitation_sum", [current_rain])[0])
    peak_rain = max(current_rain, daily_rain_today)
    if peak_rain >= settings.ALERT_HEAVY_RAIN_MM:
        alerts.append(WeatherAlert(
            alert_type="Heavy Rainfall / Waterlogging Alert",
            severity="CRITICAL" if peak_rain >= 65.0 else "HIGH",
            observed_value=f"{peak_rain:.1f} mm",
            threshold_value=f">={settings.ALERT_HEAVY_RAIN_MM:.1f} mm",
            message=f"Heavy rainfall forecasted ({peak_rain:.1f} mm). Risk of water stagnation and root suffocation.",
            recommended_action="Clear field trenches and ensure runoff drains are unblocked. Postpone urea and pesticide spraying."
        ))

    # 4. Strong Wind Alert
    max_wind_today = float(daily.get("wind_speed_10m_max", [current_wind])[0])
    peak_wind = max(current_wind, max_wind_today)
    if peak_wind >= settings.ALERT_STRONG_WIND_KMH:
        alerts.append(WeatherAlert(
            alert_type="Strong Wind Advisory",
            severity="HIGH" if peak_wind >= 50.0 else "MODERATE",
            observed_value=f"{peak_wind:.1f} km/h",
            threshold_value=f">={settings.ALERT_STRONG_WIND_KMH:.1f} km/h",
            message=f"High wind gusts detected ({peak_wind:.1f} km/h). Risk of lodging in tall crops (maize, sugarcane).",
            recommended_action="Stake vulnerable plants and trellises. Strictly halt all aerial or backpack spraying."
        ))

    # 5. High Humidity & Fungal Pathogen Warning
    if current_hum >= settings.ALERT_HIGH_HUMIDITY_PCT and (20.0 <= current_temp <= 32.0):
        alerts.append(WeatherAlert(
            alert_type="Fungal Disease Risk Alert",
            severity="MODERATE",
            observed_value=f"{current_hum:.1f}% RH, {current_temp:.1f}°C",
            threshold_value=f">={settings.ALERT_HIGH_HUMIDITY_PCT:.1f}% RH",
            message=f"Prolonged high humidity ({current_hum:.1f}%) and warm weather create ideal conditions for blight, rust, and mildew.",
            recommended_action="Scout crops closely for early signs of foliar lesions. Prepare preventative bio-fungicides."
        ))

    # Determine Safety Status
    if any(a.severity == "CRITICAL" for a in alerts):
        safety = "CRITICAL"
    elif any(a.severity in ("HIGH", "MODERATE") for a in alerts):
        safety = "ADVISORY"
    else:
        safety = "CLEAR"

    return WeatherAlertsResponse(
        latitude=raw_data.get("latitude", latitude),
        longitude=raw_data.get("longitude", longitude),
        timestamp=current.get("time", ""),
        safety_status=safety,
        active_alerts_count=len(alerts),
        alerts=alerts
    )

# Backward compatibility helpers
fetch_weather_forecast = fetch_weather_raw

def get_weather_summary(latitude: float, longitude: float):
    return get_current_weather_service(latitude, longitude)
