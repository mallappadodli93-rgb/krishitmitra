"""
AgriSmart AI - Crop Yield Model Training Script
Trains a Scikit-learn Random Forest regression pipeline on agricultural tabular data.
Includes robust missing value preprocessing, baseline comparison, and model evaluation.

Features accepted:
- Crop Type (Categorical)
- Location / State (Categorical)
- Season (Categorical)
- Soil Type (Categorical)
- Land Area in Hectares (Numerical)
- Annual / Seasonal Rainfall in mm (Numerical)
- Temperature in Celsius (Numerical)
- Soil pH (Numerical)
- Fertilizer Applied in kg (Numerical)
- Pesticide Applied in kg (Numerical)

Evaluation Metrics:
- Mean Absolute Error (MAE)
- Root Mean Squared Error (RMSE)
- Coefficient of Determination (R²)
Compared against baseline models (Dummy Mean Regressor & Linear Regression).
"""

import os
import csv
import json
import joblib
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.dummy import DummyRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error

from utils.logger import get_logger

logger = get_logger("TrainYieldModel")


def load_dataset(csv_path: str = "data/raw/crop_yield.csv"):
    """
    Loads agricultural yield CSV dataset and extracts features and targets.
    Handles empty values by converting to None / np.nan for Scikit-learn SimpleImputer.
    """
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset '{csv_path}' not found! Please generate or download it first.")

    logger.info(f"Loading agricultural yield dataset from {csv_path}...")
    
    X_rows = []
    y_vals = []

    with open(csv_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            try:
                # Target
                yield_raw = r.get("Yield_Tons_Per_Hectare", "").strip() or r.get("Yield", "").strip()
                if not yield_raw:
                    continue
                y = float(yield_raw)

                # Categorical features (None if empty string)
                crop = r.get("Crop", "").strip() or None
                location = r.get("Location", "").strip() or r.get("State", "").strip() or None
                season = r.get("Season", "").strip() or "Kharif"
                soil_type = r.get("Soil_Type", "").strip() or None

                # Numerical features (np.nan if empty string)
                def to_float(val, default=np.nan):
                    s = val.strip() if val else ""
                    return float(s) if s else default

                area = to_float(r.get("Area_Hectares", "") or r.get("Area", ""), default=1.0)
                rainfall = to_float(r.get("Rainfall_mm", "") or r.get("Annual_Rainfall", ""))
                temp = to_float(r.get("Temperature_C", "") or r.get("Temperature", ""))
                soil_ph = to_float(r.get("Soil_pH", ""))
                fertilizer = to_float(r.get("Fertilizer_kg", "") or r.get("Fertilizer", ""))
                pesticide = to_float(r.get("Pesticide_kg", "") or r.get("Pesticide", ""))

                # Row ordering:
                # [0: Crop, 1: Location, 2: Season, 3: Soil_Type,
                #  4: Area_Hectares, 5: Rainfall_mm, 6: Temperature_C, 7: Soil_pH, 8: Fertilizer_kg, 9: Pesticide_kg]
                X_rows.append([crop, location, season, soil_type, area, rainfall, temp, soil_ph, fertilizer, pesticide])
                y_vals.append(y)
            except (ValueError, KeyError) as e:
                continue

    logger.info(f"Successfully loaded {len(X_rows)} valid agricultural records.")
    return X_rows, y_vals


def build_preprocessor():
    """
    Builds a robust ColumnTransformer preprocessor with SimpleImputer for missing values.
    
    - Categorical Pipeline (Indices 0, 1, 2, 3):
      SimpleImputer (most_frequent) -> OneHotEncoder (handle_unknown='ignore')
    - Numerical Pipeline (Indices 4, 5, 6, 7, 8, 9):
      SimpleImputer (median) -> StandardScaler
    """
    cat_indices = [0, 1, 2, 3]
    num_indices = [4, 5, 6, 7, 8, 9]

    cat_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    num_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", cat_pipeline, cat_indices),
            ("num", num_pipeline, num_indices)
        ]
    )
    return preprocessor


def evaluate_model(name: str, model, X_test, y_test):
    """Calculates MAE, RMSE, and R² for a model."""
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = float(np.sqrt(mse))
    r2 = r2_score(y_test, y_pred)
    return {
        "model_name": name,
        "mae": round(float(mae), 4),
        "rmse": round(float(rmse), 4),
        "r2_score": round(float(r2), 4)
    }


def train_and_evaluate_yield_models(
    csv_path: str = "data/raw/crop_yield.csv",
    output_model_path: str = "saved_models/yield_models/crop_yield_model.pkl",
    metrics_path: str = "saved_models/yield_models/yield_metrics.json"
):
    """
    Complete training pipeline:
    1. Loads dataset with missing values.
    2. Splits into train and test sets (80/20).
    3. Builds preprocessing pipeline with imputation and encoding.
    4. Trains Baseline 1 (Dummy Mean Regressor).
    5. Trains Baseline 2 (Linear Regression).
    6. Trains Random Forest Regressor.
    7. Evaluates all three models using MAE, RMSE, and R².
    8. Serializes the best performing pipeline (Random Forest) and saves metrics JSON.
    """
    X, y = load_dataset(csv_path)

    # 80/20 train/test split with fixed random state for reproducibility
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    logger.info(f"Training set: {len(X_train)} samples | Test set: {len(X_test)} samples")

    # 1. Baseline Model 1: Dummy Mean Regressor (predicts mean yield)
    baseline_dummy = Pipeline([
        ("preprocessor", build_preprocessor()),
        ("model", DummyRegressor(strategy="mean"))
    ])
    baseline_dummy.fit(X_train, y_train)
    dummy_metrics = evaluate_model("Baseline (Mean Regressor)", baseline_dummy, X_test, y_test)

    # 2. Baseline Model 2: Linear Regression
    baseline_linear = Pipeline([
        ("preprocessor", build_preprocessor()),
        ("model", LinearRegression())
    ])
    baseline_linear.fit(X_train, y_train)
    linear_metrics = evaluate_model("Baseline (Linear Regression)", baseline_linear, X_test, y_test)

    # 3. Main Model: Random Forest Regressor
    rf_pipeline = Pipeline([
        ("preprocessor", build_preprocessor()),
        ("model", RandomForestRegressor(
            n_estimators=100,
            max_depth=16,
            min_samples_split=4,
            random_state=42,
            n_jobs=1
        ))
    ])
    logger.info("Training Random Forest Regressor pipeline...")
    rf_pipeline.fit(X_train, y_train)
    rf_metrics = evaluate_model("Random Forest Regressor", rf_pipeline, X_test, y_test)

    # Log model comparison
    logger.info("=" * 65)
    logger.info(f"{'Model Architecture':<30} | {'MAE':<8} | {'RMSE':<8} | {'R²':<8}")
    logger.info("-" * 65)
    for m in [dummy_metrics, linear_metrics, rf_metrics]:
        logger.info(f"{m['model_name']:<30} | {m['mae']:<8.4f} | {m['rmse']:<8.4f} | {m['r2_score']:<8.4f}")
    logger.info("=" * 65)

    # Calculate improvement over baselines
    mae_reduction_dummy = round(((dummy_metrics["mae"] - rf_metrics["mae"]) / dummy_metrics["mae"]) * 100, 2)
    mae_reduction_linear = round(((linear_metrics["mae"] - rf_metrics["mae"]) / linear_metrics["mae"]) * 100, 2)
    logger.info(f"Random Forest MAE improvement vs Mean Baseline: {mae_reduction_dummy}% reduction")
    logger.info(f"Random Forest MAE improvement vs Linear Regression: {mae_reduction_linear}% reduction")

    # Save best pipeline
    os.makedirs(os.path.dirname(output_model_path), exist_ok=True)
    joblib.dump(rf_pipeline, output_model_path)
    logger.info(f"✅ Random Forest pipeline saved to: {output_model_path}")

    # Save metrics JSON
    metrics_report = {
        "dataset_path": csv_path,
        "total_samples": len(X),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "features": [
            "Crop", "Location", "Season", "Soil_Type",
            "Area_Hectares", "Rainfall_mm", "Temperature_C", "Soil_pH", "Fertilizer_kg", "Pesticide_kg"
        ],
        "models_evaluated": {
            "dummy_baseline": dummy_metrics,
            "linear_baseline": linear_metrics,
            "random_forest": rf_metrics
        },
        "performance_improvement": {
            "mae_reduction_vs_dummy_percent": mae_reduction_dummy,
            "mae_reduction_vs_linear_percent": mae_reduction_linear
        }
    }
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics_report, f, indent=2)
    logger.info(f"✅ Detailed evaluation metrics saved to: {metrics_path}")

    return rf_pipeline, metrics_report


if __name__ == "__main__":
    train_and_evaluate_yield_models()
