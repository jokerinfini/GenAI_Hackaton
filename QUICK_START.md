# 🚀 Quick Start - MRV-in-a-Box (No Docker Issues!)

## ✅ **IMMEDIATE SOLUTION**

Since Docker has package version issues, let's run everything manually:

### **Step 1: Start Database Only**
```bash
# Start just the database (this works!)
docker-compose up db redis -d
```

### **Step 2: Install Dependencies**
```bash
# API
cd api
npm install

# Dashboard  
cd ../dashboard
npm install

# Calculation Service
cd ../calc
pip install -r requirements.txt

# Mobile App
cd ../mobile
npm install
```

### **Step 3: Set Environment Variables**
```bash
# In PowerShell, set the database URL
$env:DATABASE_URL="postgresql://mrv:mrv@localhost:5432/mrv"
$env:REDIS_URL="redis://localhost:6379"
$env:CALC_SERVICE_URL="http://localhost:8000"
```

### **Step 4: Initialize Database**
```bash
cd api
npx prisma generate
npx prisma db push
```

### **Step 5: Start Services (In Separate Terminals)**

#### Terminal 1 - API Service
```bash
cd api
npm run dev
```

#### Terminal 2 - Dashboard
```bash
cd dashboard
npm run dev
```

#### Terminal 3 - Calculation Service
```bash
cd calc
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Terminal 4 - Mobile App (Optional)
```bash
cd mobile
npm start
```

### **Step 6: Access Your App**
- **Main Dashboard**: http://localhost:3000
- **VM0042 Dashboard**: http://localhost:3000/vm0042
- **API**: http://localhost:3001
- **Calculation Service**: http://localhost:8000

## 🎯 **What You Get**

✅ **VM0042 Carbon Credit Platform**
- Soil Organic Carbon calculations
- RothC model integration
- Baseline emissions calculation
- Net GHG benefit calculation

✅ **Mobile App for Field Data**
- Offline data collection
- Soil sampling, climate data, management practices
- Sync to server functionality

✅ **Professional Dashboard**
- Main dashboard for basic operations
- VM0042 dashboard for advanced calculations
- Real-time calculation results

## 🔧 **If You Get Stuck**

### Database Connection Issues
```bash
# Check if database is running
docker-compose ps

# Restart database
docker-compose restart db

# Wait 30 seconds, then try again
npx prisma db push
```

### Port Already in Use
```bash
# Find and kill processes
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :8000

# Kill the process
taskkill /PID <process_id> /F
```

### Node Modules Issues
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🧪 **Test Your Setup**

1. **Create a Farmer**: Go to http://localhost:3000
2. **Add a Plot**: Draw polygon on the map
3. **Add Data**: Use mobile app for soil/climate data
4. **Run Calculations**: Use VM0042 dashboard
5. **View Results**: Check calculation outputs

## 🎉 **You're Ready!**

Your MRV-in-a-Box application is now running with full VM0042 compliance!

**Start with**: `docker-compose up db redis -d` then follow the steps above.
