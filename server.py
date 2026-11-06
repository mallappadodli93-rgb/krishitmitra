"""
KrishiMitra & AgriSmart AI - Unified FastAPI Server Launcher
Runs all 16+ API endpoints across Member 3 (Weather, Soil, Crops, Irrigation, Calendar, Water, Location)
and AI/ML Services (Disease Detection, Pest ID, Yield Prediction, Gemini Chatbot, Farm Doctor, Voice Assistant).
"""
import sys
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent
# Put backend first so Member 3 imports (app.models, app.services, app.config) resolve to backend/app
sys.path = [str(ROOT / "backend"), str(ROOT)] + sys.path

from app.main import app

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    print("=" * 70)
    print("  🌾 KrishiMitra & AgriSmart AI Unified Server Starting...")
    print(f"  Interactive Swagger UI: http://localhost:{port}/docs")
    print(f"  ReDoc Documentation:    http://localhost:{port}/redoc")
    print(f"  System Health Check:    http://localhost:{port}/health")
    print("=" * 70)
    uvicorn.run(app, host=host, port=port, reload=False)
