from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List, Dict, Any

app = FastAPI()

class TreeSample(BaseModel):
	dbh_cm: float = Field(gt=0)
	species: str | None = None

class AgroPayload(BaseModel):
	trees: List[TreeSample]
	plot_area_ha: float = Field(gt=0)
	a: float = 0.0673
	b: float = 2.84
	root_shoot_ratio: float = 0.24
	carbon_fraction: float = 0.47
	co2_conversion: float = 3.67

@app.get("/health")
async def health():
	return {"status": "ok"}

@app.post("/calculate/agroforestry")
async def calculate(payload: AgroPayload) -> Dict[str, Any]:
	tree_results: List[Dict[str, Any]] = []
	total_agb_kg = 0.0
	for t in payload.trees:
		agb_kg = payload.a * (t.dbh_cm ** payload.b)
		tree_results.append({
			"dbh_cm": t.dbh_cm,
			"agb_kg": agb_kg,
		})
		total_agb_kg += agb_kg

	belowground_biomass_kg = total_agb_kg * payload.root_shoot_ratio
	total_biomass_kg = total_agb_kg + belowground_biomass_kg
	total_carbon_kg = total_biomass_kg * payload.carbon_fraction
	total_co2e_kg = total_carbon_kg * payload.co2_conversion
	total_co2e_tonnes = total_co2e_kg / 1000.0

	return {
		"inputs": payload.model_dump(),
		"intermediates": {
			"total_agb_kg": total_agb_kg,
			"belowground_biomass_kg": belowground_biomass_kg,
			"total_biomass_kg": total_biomass_kg,
			"total_carbon_kg": total_carbon_kg,
			"total_co2e_kg": total_co2e_kg
		},
		"tree_results": tree_results,
		"total_co2e_tonnes": total_co2e_tonnes
	}
