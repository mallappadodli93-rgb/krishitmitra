"""
AgriSmart AI - Member 3 Module Entry Point.
FastAPI Application initializing all intelligence routers, CORS, and database.
"""
from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database.firebase import init_firebase
from app.api.weather import router as weather_router
from app.api.soil import router as soil_router
from app.api.crops import router as crops_router
from app.api.irrigation import router as irrigation_router
from app.api.calendar import router as calendar_router
from app.api.location import router as location_router
from app.api.water import router as water_router

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("AgriSmartAI.Main")

# Lifespan context manager for startup and shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database client (Firebase / mock fallback)
    logger.info("Initializing AgriSmart AI Backend services...")
    init_firebase()
    yield
    # Shutdown
    logger.info("Shutting down AgriSmart AI Backend services...")

# Initialize FastAPI App with comprehensive Swagger documentation at /docs
app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="""
    ## AgriSmart AI - Member 3: Weather, Soil & Location Intelligence Backend
    
    This modular backend powers:
    * **Weather Intelligence**: Real-time forecast, temperature/rainfall/humidity trends, and hazard alerts.
    * **Soil Health**: Soil NPK and pH analysis, nutrient deficiency detection, and fertilizer advice.
    * **Crop Recommendations**: Location- and season-based crop suitability matching.
    * **Smart Irrigation**: Dynamic irrigation advice considering 48-hour rainfall predictions and growth stages.
    * **Crop Calendar**: Stage-by-stage lifecycle timeline and guidance.
    * **Water Availability**: Regional water balance and drought risk assessment.
    * **Farmer Location & Data**: Farm GPS coordinates and farmer profile storage (Firebase Firestore).
    """,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS so React/Vite/Next.js frontend can connect seamlessly
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler with meaningful error messages
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error processing {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "Internal Server Error",
            "detail": str(exc) if settings.DEBUG else "An unexpected error occurred while processing the request."
        }
    )

# 4. Root Endpoint displaying exact welcome message
@app.get(
    "/",
    tags=["System"],
    status_code=status.HTTP_200_OK,
    summary="Root Welcome Endpoint"
)
def root():
    return {
        "message": "Welcome to AgriSmart AI Backend",
        "documentation": "/docs",
        "health": "/health",
        "version": "1.0.0"
    }

# 5. Health Check Endpoint at /health
@app.get(
    "/health",
    tags=["System"],
    status_code=status.HTTP_200_OK,
    summary="Service Health Check"
)
def health_check():
    return {
        "status": "healthy",
        "message": "AgriSmart AI Backend is running smoothly",
        "service": settings.APP_NAME,
        "database": "active (Firebase / memory fallback)"
    }

# Also support /api/health for standard convention
@app.get(
    "/api/health",
    tags=["System"],
    include_in_schema=False
)
def api_health():
    return health_check()

# 3. Register separate API routers
# Weather Router mounted at /api/weather (and /api/v1/weather for versioning)
app.include_router(weather_router, prefix="/api/weather")
app.include_router(weather_router, prefix="/api/v1/weather", include_in_schema=False)

# Soil Router mounted at /api/soil (and /api/v1/soil for versioning)
app.include_router(soil_router, prefix="/api/soil")
app.include_router(soil_router, prefix="/api/v1/soil", include_in_schema=False)

# Crop Recommendation Router mounted at /api/crops (and /api/v1/crops for versioning)
app.include_router(crops_router, prefix="/api/crops")
app.include_router(crops_router, prefix="/api/v1/crops", include_in_schema=False)

# Smart Irrigation Router mounted at /api/irrigation (and /api/v1/irrigation for versioning)
app.include_router(irrigation_router, prefix="/api/irrigation")
app.include_router(irrigation_router, prefix="/api/v1/irrigation", include_in_schema=False)

# Smart Crop Calendar Router mounted at /api/calendar (and /api/v1/calendar for versioning)
app.include_router(calendar_router, prefix="/api/calendar")
app.include_router(calendar_router, prefix="/api/v1/calendar", include_in_schema=False)

# Water Availability Management Router mounted at /api/water (and /api/v1/water for versioning)
app.include_router(water_router, prefix="/api/water")
app.include_router(water_router, prefix="/api/v1/water", include_in_schema=False)

# Farmer Profile & Location Router mounted at /api/location (and /api/v1/location for versioning)
app.include_router(location_router, prefix="/api/location")
app.include_router(location_router, prefix="/api/v1/location", include_in_schema=False)

# 4. Register Unified AI/ML Microservice Routers (/ai/* and /api/v1/*)
try:
    import sys
    from pathlib import Path
    _ROOT = Path(__file__).resolve().parent.parent.parent
    if str(_ROOT) not in sys.path:
        sys.path.insert(0, str(_ROOT))

    import importlib.util
    _ai_spec = importlib.util.spec_from_file_location("ai_service_routes", _ROOT / "app/routes/ai_service_routes.py")
    if _ai_spec and _ai_spec.loader:
        _ai_mod = importlib.util.module_from_spec(_ai_spec)
        _ai_spec.loader.exec_module(_ai_mod)
        app.include_router(_ai_mod.router)
        logger.info("Successfully mounted Unified AI Microservices (/ai/*) into backend")
except Exception as _e:
    logger.warning(f"Could not mount AI microservices: {_e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
