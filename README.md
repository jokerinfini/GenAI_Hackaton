# MRV-in-a-Box

A comprehensive digital platform for monitoring, reporting, and verifying carbon credits for smallholder farmers, with full **Verra VM0042 Methodology** compliance for Improved Agricultural Land Management.

## 🎯 Overview

MRV-in-a-Box addresses the high cost and complexity of traditional MRV (Monitoring, Reporting, Verification) systems that exclude smallholder farmers from carbon markets. Our solution is a modular, low-cost system that combines:

- **Offline-first mobile app** for comprehensive field data collection
- **VM0042-compliant calculation engine** with RothC model integration
- **Advanced soil organic carbon** measurement and tracking
- **Climate data integration** for accurate carbon modeling
- **Management practices tracking** for baseline vs project emissions
- **Web dashboard** for project management and VM0042 reporting

## 🏆 VM0042 Methodology Compliance

This platform implements the **Verra VM0042 Methodology for Improved Agricultural Land Management**, the market-leading standard for agricultural carbon credits:

### Core Features
- **Soil Organic Carbon (SOC) Stock Calculation** using official VM0042 formula
- **RothC Model Integration** for SOC change simulation
- **Baseline Emissions Calculation** using IPCC methodology
- **Net GHG Benefit Calculation** following VM0042 requirements
- **Complete Data Pipeline** from collection to verification

### Calculation Methods
```
SOC_stock (tonnes C/ha) = 100 × Bulk_Density × Soil_Depth × Carbon_Concentration
Net GHG Benefit = (Baseline Emissions - Project Emissions) + Change in SOC Stock
```

## 🛠️ Technology Stack

- **Backend API**: Node.js with NestJS, PostgreSQL + PostGIS, Prisma ORM
- **Calculation Service**: Python with FastAPI, RothC model integration
- **Frontend Dashboard**: Next.js with MapLibre for map interactions
- **Mobile App**: React Native with offline-first storage
- **Infrastructure**: Docker Compose for local development

## 📁 Project Structure

```
mrv-in-a-box/
├── api/                    # NestJS backend API
│   ├── src/
│   │   ├── controllers/    # API endpoints
│   │   ├── services/       # Business logic
│   │   └── dto/           # Data validation
│   └── prisma/            # Database schema
├── calc/                   # Python FastAPI calculation service
│   └── main.py            # VM0042 calculation engine
├── dashboard/              # Next.js frontend dashboard
│   └── pages/
│       ├── index.tsx      # Main dashboard
│       └── vm0042.tsx     # VM0042 dashboard
├── mobile/                 # React Native mobile app
└── docker-compose.yml      # Infrastructure setup
```

## 🚀 Quick Start (Docker Only - Recommended)

### ⚠️ Important Note
**Due to database connection issues in local development, we strongly recommend using Docker for all development and testing.**

### Prerequisites

- Docker and Docker Compose
- Git

### Running the Application

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mrv-in-a-box
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Wait for services to initialize** (about 30-60 seconds)
   ```bash
   # Check service status
   docker-compose ps
   
   # Check logs if needed
   docker-compose logs api
   ```

4. **Access the services**
   - **Main Dashboard**: http://localhost:3000
   - **VM0042 Dashboard**: http://localhost:3000/vm0042
   - **API**: http://localhost:3001
   - **Calculation Service**: http://localhost:8000

### 🔄 Automatic Database Setup

The application automatically:
- ✅ **Creates all database tables** using Prisma schema
- ✅ **Generates Prisma client** for the correct platform
- ✅ **Sets up all required indexes** and relationships
- ✅ **No manual migration needed**

### 🛠️ Development Workflow

When making code changes:

1. **For API changes:**
   ```bash
   # Rebuild and restart API
   docker-compose build api
   docker-compose up -d api
   ```

2. **For database schema changes:**
   ```bash
   # The API will automatically regenerate Prisma client on startup
   docker-compose restart api
   ```

3. **For frontend changes:**
   ```bash
   # Rebuild and restart dashboard
   docker-compose build dashboard
   docker-compose up -d dashboard
   ```

4. **For calculation service changes:**
   ```bash
   # Rebuild and restart calc service
   docker-compose build calc
   docker-compose up -d calc
   ```

### 🔧 Troubleshooting

If you encounter issues:

1. **Check service status:**
   ```bash
   docker-compose ps
   ```

2. **View logs:**
   ```bash
   docker-compose logs api
   docker-compose logs calc
   docker-compose logs dashboard
   ```

3. **Restart all services:**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

4. **Reset database (if needed):**
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

## 📊 Complete Application Workflow

### 🎯 Step-by-Step Carbon Credit Generation Process

#### 1. **Farmer Registration & Plot Setup**
```
Dashboard → Add Farmer → Draw Plot → Save
```
- Create farmer profile with contact information
- Draw plot boundaries on interactive map
- System calculates plot area automatically

#### 2. **Data Collection Phase**
```
Mobile App → Field Data Collection → Sync to Dashboard
```

**A. Tree Sampling (Quarterly)**
- Measure tree diameter (DBH)
- Record species information
- GPS location tracking
- Offline storage with sync

**B. Soil Sampling (Annually)**
- Bulk density measurement (g/cm³)
- Soil depth recording (0-30 cm)
- Carbon concentration analysis (%)
- Clay content determination (%)

**C. Climate Data (Monthly)**
- Temperature recording (°C)
- Rainfall measurement (mm)
- Evaporation data (mm)
- Historical data import

**D. Management Practices (Monthly)**
- Carbon inputs tracking (t C/ha)
- Fertilizer application (kg N/ha)
- Soil cover monitoring
- Livestock presence tracking

#### 3. **VM0042 Calculation Phase**
```
Dashboard → VM0042 → Run Calculations → View Results
```

**A. SOC Stock Calculation**
- Uses collected soil samples
- Applies VM0042 formula
- Calculates carbon stock per hectare
- **Result**: Current soil carbon content

**B. RothC Simulation**
- Inputs: Climate + Soil + Management data
- Simulates 10-year SOC changes
- Models carbon sequestration rates
- **Result**: Projected carbon sequestration

**C. Baseline Emissions**
- Calculates historical emissions
- Uses IPCC methodology
- Considers fertilizer and livestock
- **Result**: Baseline emission levels

**D. Net GHG Benefit**
- Combines all calculations
- Follows VM0042 methodology
- **Result**: Total carbon credits generated

#### 4. **Carbon Credit Value for Farmers**

### 💰 **Financial Impact**

**Example Calculation:**
- **Plot Size**: 5 hectares
- **SOC Increase**: 2.5 tonnes C/ha/year
- **Carbon Credits**: 2.5 × 44/12 = 9.17 tCO2e/ha/year
- **Total Credits**: 9.17 × 5 ha = 45.85 tCO2e/year
- **Market Value**: 45.85 × $15/credit = **$687.75/year**

### 🌱 **Environmental Benefits**

1. **Soil Health Improvement**
   - Increased water retention
   - Better crop yields
   - Reduced erosion
   - Enhanced biodiversity

2. **Climate Impact**
   - Carbon sequestration
   - Reduced greenhouse gas emissions
   - Climate change mitigation
   - Sustainable agriculture

3. **Economic Benefits**
   - Additional income stream
   - Improved crop productivity
   - Reduced input costs
   - Market access opportunities

### 📈 **Long-term Value**

**Year 1**: $687.75 in carbon credits
**Year 5**: $1,375.50 (doubled due to soil improvement)
**Year 10**: $2,063.25 (tripled with continued practices)

**Total 10-year value**: ~$15,000 per 5-hectare plot

## 📊 API Endpoints

### Core Data Management

#### Farmers
- `POST /farmers` - Create a new farmer
- `GET /farmers` - List all farmers
- `GET /farmers/:id` - Get farmer details

#### Plots
- `POST /plots` - Create a new plot
- `GET /plots` - List all plots
- `GET /plots/:id` - Get plot details

#### Tree Samples
- `POST /plots/:plotId/trees` - Add tree samples to a plot
- `GET /plots/:plotId/trees` - Get tree samples for a plot

### VM0042 Data Collection

#### Soil Samples
- `POST /soil-samples` - Create soil sample
- `GET /soil-samples` - List all soil samples
- `GET /soil-samples/plot/:plotId` - Get soil samples for a plot
- `GET /soil-samples/plot/:plotId/latest` - Get latest soil sample

#### Climate Data
- `POST /climate-data` - Create climate data entry
- `POST /climate-data/plot/:plotId/bulk` - Bulk create climate data
- `GET /climate-data/plot/:plotId` - Get climate data for a plot
- `GET /climate-data/plot/:plotId/year/:year` - Get climate data by year
- `GET /climate-data/plot/:plotId/averages` - Get monthly averages

#### Management Practices
- `POST /management-practices` - Create management practice
- `POST /management-practices/plot/:plotId/bulk` - Bulk create practices
- `GET /management-practices/plot/:plotId` - Get practices for a plot
- `GET /management-practices/plot/:plotId/year/:year/summary` - Get annual summary

### VM0042 Calculations

#### Legacy Calculations
- `POST /calc/:plotId/agroforestry` - Legacy biomass calculation

#### VM0042 Calculations
- `POST /calc/vm0042/:plotId/soc` - Calculate SOC stock
- `POST /calc/vm0042/:plotId/rothc` - Run RothC simulation
- `POST /calc/vm0042/:plotId/baseline` - Calculate baseline emissions
- `POST /calc/vm0042/:plotId/net-benefit` - Calculate net GHG benefit

### Reports
- `GET /reports/project/:farmerId` - Generate HTML report for a farmer

## 🔬 VM0042 Calculation Methodology

### 1. Soil Organic Carbon (SOC) Stock Calculation

The system uses the official VM0042 formula for SOC stock calculation:

```
SOC_stock (tonnes C/ha) = 100 × Bulk_Density × Soil_Depth × Carbon_Concentration
```

Where:
- **Bulk Density**: Mass of dry soil per unit volume (g/cm³)
- **Soil Depth**: Sampling depth in centimeters (0-30 cm recommended)
- **Carbon Concentration**: Percentage of carbon in soil sample (%)

### 2. RothC Model Integration

The platform integrates the RothC model for simulating SOC changes over time:

**Required Inputs:**
- **Climate Data**: Monthly temperature, rainfall, evaporation
- **Soil Data**: Clay content, initial SOC stock
- **Management Data**: Carbon inputs, DPM/RPM ratio, soil cover

**Model Outputs:**
- Annual SOC changes
- Carbon sequestration rates
- Long-term SOC projections

### 3. Baseline Emissions Calculation

Uses IPCC methodology for baseline emissions:

**N₂O Emissions:**
```
N₂O_emissions = Fertilizer_N × 0.01 kg N₂O-N per kg N applied
N₂O_CO₂e = N₂O_emissions × 298 (GWP) / 1000
```

**CH₄ Emissions:**
```
CH₄_emissions = Livestock_count × 50 kg CH₄ per head per year
CH₄_CO₂e = CH₄_emissions × 25 (GWP) / 1000
```

### 4. Net GHG Benefit Calculation

The final carbon credit calculation follows VM0042 methodology:

```
Net GHG Benefit = (Baseline Emissions - Project Emissions) + Change in SOC Stock
```

Where:
- **Baseline Emissions**: Historical emissions from conventional practices
- **Project Emissions**: Emissions under improved practices
- **SOC Change**: Carbon sequestered in soil (converted to CO₂e)

## 📱 Mobile App Features

### Data Collection Modules

#### Tree Sampling
- Species identification
- DBH (Diameter at Breast Height) measurement
- GPS location tracking
- Offline data storage

#### Soil Sampling
- Bulk density measurement
- Soil depth recording
- Carbon concentration analysis
- Clay content determination
- Sampling date tracking

#### Climate Data
- Temperature recording
- Rainfall measurement
- Evaporation data
- Monthly data entry
- Historical data import

#### Management Practices
- Carbon input tracking
- Fertilizer application records
- Soil cover monitoring
- Livestock presence tracking
- Practice type categorization

### Offline Capabilities
- **Offline-first design** for field work
- **Data synchronization** when connectivity available
- **Conflict resolution** for data updates
- **Bulk data upload** for efficiency

## 🖥️ Dashboard Features

### Main Dashboard
- **Farmer Management**: Create and manage farmer profiles
- **Plot Creation**: Draw polygons and assign to farmers
- **Tree Data**: View and manage tree samples
- **Legacy Calculations**: Run basic biomass calculations
- **Report Generation**: Generate HTML reports

### VM0042 Dashboard
- **Data Visualization**: View soil, climate, and management data
- **Calculation Workflows**: Step-by-step VM0042 calculations
- **Results Display**: Real-time calculation results
- **Data Validation**: Ensure data completeness for calculations
- **Audit Trail**: Track all calculation history

## 🔧 Development

### Local Development Setup (Advanced Users Only)

⚠️ **Note**: Local development may have database connection issues. Use Docker for reliable development.

1. **API Service**
   ```bash
   cd api
   npm install
   npm run dev
   ```

2. **Calculation Service**
   ```bash
   cd calc
   pip install -r requirements.txt
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Dashboard**
   ```bash
   cd dashboard
   npm install
   npm run dev
   ```

4. **Mobile App**
   ```bash
   cd mobile
   npm install
   npm start
   ```

### Database Management

```bash
# Generate Prisma client
npm run prisma:generate

# Push schema changes
npm run prisma:push

# Run migrations (if using migrations)
npm run prisma:migrate

# Seed the database
npm run prisma:seed
```

## 📋 Data Requirements

### For VM0042 Compliance

#### Soil Data (Required)
- Bulk density (g/cm³)
- Soil depth (cm)
- Carbon concentration (%)
- Clay content (%)
- Sampling date

#### Climate Data (Required)
- Monthly mean temperature (°C)
- Monthly total rainfall (mm)
- Monthly evaporation (mm)
- Minimum 1 year of data

#### Management Data (Required)
- Monthly carbon inputs (t C/ha)
- DPM/RPM ratio (default: 1.44)
- Soil cover status (vegetated/bare)
- Fertilizer application (kg N/ha)
- Livestock presence and count

#### Baseline Information (Required)
- Historical fertilizer use
- Livestock management practices
- Land use history
- Previous management practices

## 🎯 Carbon Credit Generation Workflow

### 1. Project Setup
- Create farmer profile
- Define plot boundaries
- Establish baseline conditions

### 2. Data Collection
- Collect soil samples (annually)
- Record climate data (monthly)
- Track management practices (monthly)
- Monitor tree growth (quarterly)

### 3. Calculations
- Calculate initial SOC stock
- Run RothC simulations
- Determine baseline emissions
- Calculate net GHG benefit

### 4. Verification
- Generate compliance reports
- Prepare audit documentation
- Submit for verification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For questions or support, please open an issue in the repository.

## 🔗 Related Documentation

- [Verra VM0042 Methodology](https://verra.org/methodology/vm0042/)
- [IPCC Guidelines for National Greenhouse Gas Inventories](https://www.ipcc-nggip.iges.or.jp/)
- [RothC Model Documentation](https://www.rothamsted.ac.uk/rothamsted-carbon-model-rothc)

---

**MRV-in-a-Box** - Making carbon credits accessible to smallholder farmers through VM0042 compliance.

