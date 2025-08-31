from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
from datetime import datetime
import json
import math

app = FastAPI(title="MRV Calculation Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for VM0042 data
class SoilSample(BaseModel):
    bulkDensity: float = Field(gt=0.5, le=2.0)  # g/cm³
    soilDepth: float = Field(gt=10, le=100)     # cm
    carbonConcentration: float = Field(gt=0.1, le=10.0)  # %
    clayContent: float = Field(gt=0, le=100)    # %

class ClimateData(BaseModel):
    month: int = Field(ge=1, le=12)
    year: int = Field(ge=2000, le=2030)
    meanTemperature: float = Field(ge=-50, le=60)  # °C
    totalRainfall: float = Field(ge=0, le=2000)    # mm
    evaporation: float = Field(ge=0, le=500)       # mm

class ManagementPractice(BaseModel):
    month: int = Field(ge=1, le=12)
    year: int = Field(ge=2000, le=2030)
    carbonInputs: float = Field(ge=0, le=50)      # t C/ha
    dpmRpmRatio: float = Field(ge=0.5, le=3.0)    # default 1.44
    soilCover: bool                                # vegetated/bare
    fertilizerN: float = Field(ge=0, le=500)      # kg N/ha
    livestockPresent: bool                         # for CH4 calculation

class TreeSample(BaseModel):
    dbh_cm: float = Field(gt=0)
    species: Optional[str] = None

# VM0042 Calculation Models
class SOCCalculationPayload(BaseModel):
    soilSamples: List[SoilSample]

class RothCCalculationPayload(BaseModel):
    climateData: List[ClimateData]
    soilData: SoilSample
    managementData: List[ManagementPractice]
    simulationYears: int = Field(ge=1, le=50, default=10)

class BaselineEmissionPayload(BaseModel):
    fertilizerN: float = Field(ge=0, le=500)      # kg N/ha/year
    livestockPresent: bool = False
    livestockCount: int = Field(ge=0, le=1000, default=0)

class VM0042CalculationPayload(BaseModel):
    plotId: str
    soilSamples: List[SoilSample]
    climateData: List[ClimateData]
    managementData: List[ManagementPractice]
    baselineEmissions: BaselineEmissionPayload
    simulationYears: int = Field(ge=1, le=50, default=10)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "MRV Calculation Service"}

@app.post("/calculate/vm0042/soc")
async def calculate_soc_stock(payload: SOCCalculationPayload) -> Dict[str, Any]:
    """
    Calculate Soil Organic Carbon (SOC) stock using VM0042 formula
    SOC_stock (tonnes C/ha) = 100 * Bulk_Density * Soil_Depth * Carbon_Concentration
    """
    results = []
    total_soc = 0.0
    
    for i, sample in enumerate(payload.soilSamples):
        soc_stock = 100 * sample.bulkDensity * sample.soilDepth * sample.carbonConcentration
        results.append({
            "sample_id": i + 1,
            "bulk_density": sample.bulkDensity,
            "soil_depth": sample.soilDepth,
            "carbon_concentration": sample.carbonConcentration,
            "clay_content": sample.clayContent,
            "soc_stock_tC_ha": soc_stock
        })
        total_soc += soc_stock
    
    avg_soc = total_soc / len(payload.soilSamples) if payload.soilSamples else 0
    
    return {
        "method": "VM0042_SOC_Calculation",
        "formula": "SOC_stock = 100 * Bulk_Density * Soil_Depth * Carbon_Concentration",
        "samples": results,
        "total_soc_tC_ha": total_soc,
        "average_soc_tC_ha": avg_soc,
        "units": {
            "bulk_density": "g/cm³",
            "soil_depth": "cm", 
            "carbon_concentration": "%",
            "soc_stock": "tonnes C/ha"
        }
    }

def run_rothc_simulation(climate_data: List[ClimateData], 
                        soil_data: SoilSample,
                        management_data: List[ManagementPractice],
                        simulation_years: int) -> Dict[str, Any]:
    """
    Simplified RothC model simulation
    This is a simplified implementation - in production, use a proper RothC library
    """
    # Convert data to monthly format
    monthly_data = {}
    for climate in climate_data:
        key = f"{climate.year}-{climate.month:02d}"
        monthly_data[key] = {
            "temperature": climate.meanTemperature,
            "rainfall": climate.totalRainfall,
            "evaporation": climate.evaporation,
            "carbon_inputs": 0,
            "dpm_rpm_ratio": 1.44,
            "soil_cover": True,
            "fertilizer_n": 0
        }
    
    for management in management_data:
        key = f"{management.year}-{management.month:02d}"
        if key in monthly_data:
            monthly_data[key].update({
                "carbon_inputs": management.carbonInputs,
                "dpm_rpm_ratio": management.dpmRpmRatio,
                "soil_cover": management.soilCover,
                "fertilizer_n": management.fertilizerN
            })
    
    # Simplified RothC calculation
    # In reality, this would use the full RothC model with soil carbon pools
    initial_soc = 100 * soil_data.bulkDensity * soil_data.soilDepth * soil_data.carbonConcentration
    
    # Simplified decomposition and carbon input simulation
    soc_changes = []
    current_soc = initial_soc
    
    for year in range(simulation_years):
        annual_carbon_input = 0
        annual_decomposition = 0
        
        for month in range(1, 13):
            # Get monthly data (use average if not available)
            month_key = f"{year + 2020}-{month:02d}"
            if month_key in monthly_data:
                data = monthly_data[month_key]
                annual_carbon_input += data["carbon_inputs"]
                
                # Simplified decomposition based on temperature and moisture
                temp_factor = 1 + 0.1 * (data["temperature"] - 20)  # Temperature effect
                moisture_factor = 1 + 0.05 * (data["rainfall"] / 100 - 1)  # Moisture effect
                decomposition_rate = 0.02 * temp_factor * moisture_factor  # 2% base rate
                
                annual_decomposition += current_soc * decomposition_rate / 12
        
        # Update SOC
        soc_change = annual_carbon_input - annual_decomposition
        current_soc += soc_change
        
        soc_changes.append({
            "year": year + 2020,
            "initial_soc": current_soc - soc_change,
            "carbon_inputs": annual_carbon_input,
            "decomposition": annual_decomposition,
            "soc_change": soc_change,
            "final_soc": current_soc
        })
    
    return {
        "initial_soc_tC_ha": initial_soc,
        "final_soc_tC_ha": current_soc,
        "total_soc_change_tC_ha": current_soc - initial_soc,
        "annual_changes": soc_changes,
        "soil_properties": {
            "bulk_density": soil_data.bulkDensity,
            "clay_content": soil_data.clayContent,
            "depth": soil_data.soilDepth
        }
    }

@app.post("/calculate/vm0042/rothc")
async def calculate_rothc(payload: RothCCalculationPayload) -> Dict[str, Any]:
    """
    Run RothC model simulation for SOC change calculation
    """
    try:
        result = run_rothc_simulation(
            payload.climateData,
            payload.soilData,
            payload.managementData,
            payload.simulationYears
        )
        
        return {
            "method": "VM0042_RothC_Simulation",
            "simulation_years": payload.simulationYears,
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RothC calculation failed: {str(e)}")

@app.post("/calculate/vm0042/baseline")
async def calculate_baseline_emissions(payload: BaselineEmissionPayload) -> Dict[str, Any]:
    """
    Calculate baseline emissions (N2O and CH4) using IPCC methodology
    """
    # N2O emissions from fertilizer (IPCC Tier 1)
    # EF1 = 0.01 kg N2O-N per kg N applied
    n2o_emissions = payload.fertilizerN * 0.01  # kg N2O-N/ha
    
    # Convert to CO2e (N2O has 298x GWP of CO2)
    n2o_co2e = n2o_emissions * 298 / 1000  # t CO2e/ha
    
    # CH4 emissions from livestock (simplified)
    ch4_emissions = 0.0
    if payload.livestockPresent and payload.livestockCount > 0:
        # Simplified: 50 kg CH4 per head per year
        ch4_emissions = payload.livestockCount * 50  # kg CH4/ha
        ch4_co2e = ch4_emissions * 25 / 1000  # t CO2e/ha (CH4 has 25x GWP)
    else:
        ch4_co2e = 0.0
    
    total_co2e = n2o_co2e + ch4_co2e
    
    return {
        "method": "VM0042_Baseline_Emissions",
        "n2o_emissions_kg_N2O_N_ha": n2o_emissions,
        "n2o_emissions_tCO2e_ha": n2o_co2e,
        "ch4_emissions_kg_CH4_ha": ch4_emissions,
        "ch4_emissions_tCO2e_ha": ch4_co2e,
        "total_baseline_emissions_tCO2e_ha": total_co2e,
        "inputs": {
            "fertilizer_n_kg_ha": payload.fertilizerN,
            "livestock_present": payload.livestockPresent,
            "livestock_count": payload.livestockCount
        }
    }

@app.post("/calculate/vm0042/net-benefit")
async def calculate_net_ghg_benefit(payload: VM0042CalculationPayload) -> Dict[str, Any]:
    """
    Calculate net GHG benefit according to VM0042 methodology
    Net GHG Benefit = (Baseline Emissions - Project Emissions) + Change in SOC Stock
    """
    try:
        # 1. Calculate initial SOC stock
        soc_result = await calculate_soc_stock(SOCCalculationPayload(soilSamples=payload.soilSamples))
        initial_soc = soc_result["average_soc_tC_ha"]
        
        # 2. Run RothC simulation
        rothc_result = await calculate_rothc(RothCCalculationPayload(
            climateData=payload.climateData,
            soilData=payload.soilSamples[0],  # Use first sample as representative
            managementData=payload.managementData,
            simulationYears=payload.simulationYears
        ))
        soc_change = rothc_result["result"]["total_soc_change_tC_ha"]
        
        # 3. Calculate baseline emissions
        baseline_result = await calculate_baseline_emissions(payload.baselineEmissions)
        baseline_emissions = baseline_result["total_baseline_emissions_tCO2e_ha"]
        
        # 4. Calculate project emissions (simplified - same as baseline for now)
        project_emissions = baseline_emissions
        
        # 5. Convert SOC change to CO2e (44/12 ratio)
        soc_change_co2e = soc_change * 44 / 12  # t CO2e/ha
        
        # 6. Calculate net GHG benefit
        net_benefit = (baseline_emissions - project_emissions) + soc_change_co2e
        
        return {
            "method": "VM0042_Net_GHG_Benefit",
            "formula": "Net GHG Benefit = (Baseline Emissions - Project Emissions) + Change in SOC Stock",
            "plot_id": payload.plotId,
            "simulation_years": payload.simulationYears,
            "results": {
                "initial_soc_tC_ha": initial_soc,
                "soc_change_tC_ha": soc_change,
                "soc_change_tCO2e_ha": soc_change_co2e,
                "baseline_emissions_tCO2e_ha": baseline_emissions,
                "project_emissions_tCO2e_ha": project_emissions,
                "net_ghg_benefit_tCO2e_ha": net_benefit
            },
            "components": {
                "soc_calculation": soc_result,
                "rothc_simulation": rothc_result,
                "baseline_emissions": baseline_result
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Net GHG benefit calculation failed: {str(e)}")

# Legacy endpoint for backward compatibility
class AgroPayload(BaseModel):
    trees: List[TreeSample]
    plot_area_ha: float = Field(gt=0)
    a: float = 0.0673
    b: float = 2.84
    root_shoot_ratio: float = 0.24
    carbon_fraction: float = 0.47
    co2_conversion: float = 3.67

@app.post("/calculate/agroforestry")
async def calculate_legacy(payload: AgroPayload) -> Dict[str, Any]:
    """
    Legacy calculation method - kept for backward compatibility
    """
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
        "method": "Legacy_Allometric",
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
