# 🚀 Start Your MRV-in-a-Box Services

## ✅ **Fixed Issues**
- Fixed TypeScript compilation errors in API
- Fixed Python dependencies for calculation service
- Database is running in Docker

## 🎯 **Start Services (Run these in separate terminals)**

### **Terminal 1 - API Service**
```bash
cd api
npm run dev
```

### **Terminal 2 - Dashboard**
```bash
cd dashboard
npm run dev
```

### **Terminal 3 - Calculation Service**
```bash
cd calc
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 🌐 **Access Your Application**

- **Main Dashboard**: http://localhost:3000
- **VM0042 Dashboard**: http://localhost:3000/vm0042
- **API**: http://localhost:3001
- **Calculation Service**: http://localhost:8000

## 🎉 **What You Get**

✅ **VM0042 Carbon Credit Platform**
- Soil Organic Carbon calculations
- RothC model integration
- Baseline emissions calculation
- Net GHG benefit calculation

✅ **Working Dashboard**
- Interactive map with polygon drawing
- Farmer and plot management
- Real-time data visualization

✅ **Mobile App Ready**
- Offline data collection
- Soil sampling, climate data, management practices

## 🔧 **If You Get Errors**

### API Errors
- Make sure you're in the `api` directory
- Run `npm install` if needed

### Dashboard Errors  
- Make sure you're in the `dashboard` directory
- Run `npm install` if needed

### Calculation Service Errors
- Make sure you're in the `calc` directory
- Run `pip install fastapi uvicorn pydantic` if needed

## 🎯 **Quick Test**
1. Go to http://localhost:3000
2. Create a farmer
3. Draw a plot polygon on the map
4. Test the VM0042 dashboard at http://localhost:3000/vm0042

**Your MRV-in-a-Box application is ready!** 🚀
