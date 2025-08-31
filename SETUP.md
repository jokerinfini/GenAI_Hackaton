# MRV-in-a-Box Setup Guide

## 🚀 Quick Start - Run Your App

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ installed
- Python 3.8+ installed

### Step 1: Install Dependencies

#### API Service
```bash
cd api
npm install
```

#### Dashboard
```bash
cd dashboard
npm install
```

#### Calculation Service
```bash
cd calc
pip install -r requirements.txt
```

#### Mobile App
```bash
cd mobile
npm install
```

### Step 2: Start the Application

#### Option A: Using Docker Compose (Recommended)
```bash
# From the root directory
docker-compose up -d
```

This will start all services:
- Database (PostgreSQL + PostGIS): localhost:5432
- Redis: localhost:6379
- API: localhost:3001
- Dashboard: localhost:3000
- Calculation Service: localhost:8000
- Mobile Development Server: localhost:8081

#### Option B: Manual Start (Development)

1. **Start Database and Redis**
```bash
docker-compose up db redis -d
```

2. **Start API Service**
```bash
cd api
npm run dev
```

3. **Start Dashboard**
```bash
cd dashboard
npm run dev
```

4. **Start Calculation Service**
```bash
cd calc
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

5. **Start Mobile App**
```bash
cd mobile
npm start
```

### Step 3: Initialize Database

After starting the services, initialize the database:

```bash
# Generate Prisma client
cd api
npx prisma generate

# Push schema to database
npx prisma db push

# Seed the database (optional)
npm run prisma:seed
```

### Step 4: Access Your Application

- **Main Dashboard**: http://localhost:3000
- **VM0042 Dashboard**: http://localhost:3000/vm0042
- **API Documentation**: http://localhost:3001
- **Calculation Service**: http://localhost:8000
- **Mobile App**: http://localhost:8081

## 🔧 Troubleshooting

### Common Issues

#### 1. Port Already in Use
If you get "port already in use" errors:
```bash
# Find processes using the port
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :8000

# Kill the process
taskkill /PID <process_id> /F
```

#### 2. Database Connection Issues
```bash
# Check if database is running
docker-compose ps

# Restart database
docker-compose restart db

# Check database logs
docker-compose logs db
```

#### 3. Prisma Issues
```bash
# Reset Prisma
cd api
npx prisma generate
npx prisma db push --force-reset
```

#### 4. Node Modules Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Development Mode

For development, you can run services individually:

#### API Development
```bash
cd api
npm run dev
```

#### Dashboard Development
```bash
cd dashboard
npm run dev
```

#### Calculation Service Development
```bash
cd calc
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 📱 Mobile App Setup

### For Android Development
```bash
cd mobile
npm start
# Then press 'a' for Android
```

### For iOS Development (macOS only)
```bash
cd mobile
npm start
# Then press 'i' for iOS
```

## 🧪 Testing Your Setup

### 1. Test API Health
```bash
curl http://localhost:3001/health
```

### 2. Test Calculation Service
```bash
curl http://localhost:8000/health
```

### 3. Test Database Connection
```bash
cd api
npx prisma studio
```

### 4. Create Test Data
1. Go to http://localhost:3000
2. Create a farmer
3. Create a plot
4. Add some tree samples
5. Test the VM0042 dashboard

## 📊 VM0042 Workflow Test

### 1. Create Farmer and Plot
- Use the main dashboard to create a farmer
- Draw a plot polygon on the map

### 2. Add VM0042 Data
- Use the mobile app to add soil samples
- Add climate data
- Add management practices

### 3. Run Calculations
- Go to VM0042 dashboard
- Select your farmer and plot
- Run SOC calculation
- Run RothC simulation
- Calculate net GHG benefit

## 🔍 Monitoring

### Check Service Status
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs api
docker-compose logs calc
docker-compose logs dashboard
```

### Database Management
```bash
# Open Prisma Studio
cd api
npx prisma studio

# Database shell
docker-compose exec db psql -U mrv -d mrv
```

## 🚀 Production Deployment

For production deployment, you'll need to:

1. **Set Environment Variables**
```bash
# Create .env files for each service
cp .env.example .env
```

2. **Configure Database**
```bash
# Use production database
DATABASE_URL=postgresql://user:password@host:port/database
```

3. **Build Docker Images**
```bash
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

## 📞 Support

If you encounter issues:

1. Check the logs: `docker-compose logs`
2. Verify all services are running: `docker-compose ps`
3. Check database connection: `npx prisma studio`
4. Review the README.md for detailed documentation

## 🎯 Next Steps

After successful setup:

1. **Explore the VM0042 Dashboard**: http://localhost:3000/vm0042
2. **Test Mobile App**: Add soil samples and climate data
3. **Run Calculations**: Test the RothC model integration
4. **Review API Documentation**: Check all new endpoints
5. **Customize for Your Needs**: Modify calculations or add features

Your MRV-in-a-Box application is now ready for VM0042 carbon credit generation! 🎉
