# MRV-in-a-Box

A digital platform for monitoring, reporting, and verifying carbon credits for smallholder farmers, with a focus on the Agroforestry track.

## Overview

MRV-in-a-Box addresses the high cost and complexity of traditional MRV (Monitoring, Reporting, Verification) systems that exclude smallholder farmers from carbon markets. Our solution is a modular, low-cost system that combines:

- **Offline-first mobile app** for field data collection
- **Free satellite data** integration
- **Transparent calculation engine** for carbon credit calculations
- **Web dashboard** for project management and reporting

## Technology Stack

- **Backend API**: Node.js with NestJS, PostgreSQL + PostGIS, Prisma ORM
- **Calculation Service**: Python with FastAPI
- **Frontend Dashboard**: Next.js with MapLibre for map interactions
- **Mobile App**: React Native with offline-first storage
- **Infrastructure**: Docker Compose for local development

## Project Structure

```
mrv-in-a-box/
├── api/           # NestJS backend API
├── calc/          # Python FastAPI calculation service
├── dashboard/     # Next.js frontend dashboard
├── mobile/        # React Native mobile app
└── docker-compose.yml
```

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.8+ (for local development)

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

3. **Initialize the database**
   ```bash
   # Generate Prisma client
   docker-compose exec api npm run prisma:generate
   
   # Push schema to database
   docker-compose exec api npm run prisma:push
   
   # Seed the database
   docker-compose exec api npm run prisma:seed
   ```

4. **Access the services**
   - **Dashboard**: http://localhost:3000
   - **API**: http://localhost:3001
   - **Calculation Service**: http://localhost:8000
   - **Mobile Development Server**: http://localhost:8081

## API Endpoints

### Farmers
- `POST /farmers` - Create a new farmer
- `GET /farmers` - List all farmers
- `GET /farmers/:id` - Get farmer details

### Plots
- `POST /plots` - Create a new plot
- `GET /plots` - List all plots
- `GET /plots/:id` - Get plot details

### Tree Samples
- `POST /plots/:plotId/trees` - Add tree samples to a plot
- `GET /plots/:plotId/trees` - Get tree samples for a plot

### Calculations
- `POST /calc/:plotId/agroforestry` - Calculate carbon credits for a plot

### Reports
- `GET /reports/project/:farmerId` - Generate HTML report for a farmer

## Carbon Calculation Methodology

The system uses the generic tropical allometric equation for aboveground biomass estimation:

```
AGB_kg = a × (DBH_cm^b)
```

Where:
- `a = 0.0673` (allometric parameter)
- `b = 2.84` (allometric exponent)

The calculation includes:
1. **Aboveground biomass** estimation using DBH measurements
2. **Belowground biomass** estimation (24% of aboveground)
3. **Carbon content** (47% of total biomass)
4. **CO₂ equivalent conversion** (3.67 kg CO₂ per kg carbon)

## Demo Flow

1. **Create a Farmer**: Use the dashboard to create a new farmer
2. **Create a Plot**: Draw a polygon on the map and assign it to the farmer
3. **Add Tree Samples**: Use the mobile app to add tree measurements
4. **Calculate Credits**: Use the dashboard to calculate carbon credits
5. **Generate Report**: View the detailed HTML report

## Development

### Local Development Setup

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please open an issue in the repository.

