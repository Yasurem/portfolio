from fastapi import FastAPI
from api.health import router as health_router

app = FastAPI(title="Portfolio Backend API")

# Register Routers
app.include_router(health_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Portfolio API"}
