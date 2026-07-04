from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List 
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI(
    title="Human Details API",
    description="A simple API to manage details of humans (Name, Address, City)",
    version="1.0.0"
)

# Instrument the app to expose /metrics for Prometheus
Instrumentator().instrument(app).expose(app)

# Enable CORS for the local frontend development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Schemas
class HumanBase(BaseModel):
    name: str = Field(..., min_length=1, description="The name of the human", examples=["Alice Smith"])
    address: str = Field(..., min_length=1, description="The street address", examples=["123 Emerald Ave"])
    city: str = Field(..., min_length=1, description="The city of residence", examples=["Metropolis"])

class HumanCreate(HumanBase):
    pass

class Human(HumanBase):
    id: int = Field(..., description="The unique ID of the human record")

# In-memory "database" with initial elegant mock data
db_humans: List[Human] = [
    Human(id=1, name="Sophia Vance", address="742 Evergreen Terrace", city="Springfield"),
    Human(id=2, name="Liam Sterling", address="10 Downing Street", city="London"),
    Human(id=3, name="Aria Montgomery", address="221B Baker Street", city="London"),
    Human(id=4, name="Marcus Aurelius", address="1 Via Appia Antica", city="Rome"),
    Human(id=5, name="Elena Rostova", address="15 Nevsky Prospekt", city="Saint Petersburg"),
    Human(id=6, name="Hotfix Hero", address="911 Emergency Lane", city="Patchville")
]

# Track next auto-incrementing ID
next_id = 7

@app.get("/api/humans", response_model=List[Human])
def get_humans():
    """Retrieve all human records."""
    return db_humans

@app.post("/api/humans", response_model=Human, status_code=status.HTTP_201_CREATED)
def create_human(human_in: HumanCreate):
    """Create a new human record with validated name, address, and city."""
    global next_id
    
    # Check if a human with exact details already exists to prevent duplicate spam
    for h in db_humans:
        if (h.name.strip().lower() == human_in.name.strip().lower() and 
            h.address.strip().lower() == human_in.address.strip().lower() and 
            h.city.strip().lower() == human_in.city.strip().lower()):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="A human with these exact details already exists."
            )

    new_human = Human(
        id=next_id,
        name=human_in.name.strip(),
        address=human_in.address.strip(),
        city=human_in.city.strip()
    )
    db_humans.append(new_human)
    next_id += 1
    return new_human

# Triggering nodemon watch V2
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
