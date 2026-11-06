"""
AgriSmart AI - Farm Doctor Package Exports
Wraps FarmDoctor and helper functions from farm_doctor.py for backwards compatibility.
"""

from modules.farm_doctor.farm_doctor import (
    FarmDoctor,
    WeatherContextEvaluator,
    DiagnosticModelRouter,
    AgronomicPrescriptionEngine,
    get_farm_doctor,
    diagnose_crop
)

__all__ = [
    "FarmDoctor",
    "WeatherContextEvaluator",
    "DiagnosticModelRouter",
    "AgronomicPrescriptionEngine",
    "get_farm_doctor",
    "diagnose_crop"
]
