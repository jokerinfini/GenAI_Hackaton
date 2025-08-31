-- Create Farmer table
CREATE TABLE IF NOT EXISTS "Farmer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Farmer_pkey" PRIMARY KEY ("id")
);

-- Create Plot table
CREATE TABLE IF NOT EXISTS "Plot" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "geometry" JSONB NOT NULL,
    "areaHa" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Plot_pkey" PRIMARY KEY ("id")
);

-- Create TreeSample table
CREATE TABLE IF NOT EXISTS "TreeSample" (
    "id" TEXT NOT NULL,
    "plotId" TEXT NOT NULL,
    "species" TEXT,
    "dbh_cm" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TreeSample_pkey" PRIMARY KEY ("id")
);

-- Create CreditCalc table
CREATE TABLE IF NOT EXISTS "CreditCalc" (
    "id" TEXT NOT NULL,
    "plotId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "total_tCO2e" DOUBLE PRECISION NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CreditCalc_pkey" PRIMARY KEY ("id")
);

-- Create SoilSample table
CREATE TABLE IF NOT EXISTS "SoilSample" (
    "id" TEXT NOT NULL,
    "plotId" TEXT NOT NULL,
    "bulkDensity" DOUBLE PRECISION NOT NULL,
    "soilDepth" DOUBLE PRECISION NOT NULL,
    "carbonConcentration" DOUBLE PRECISION NOT NULL,
    "clayContent" DOUBLE PRECISION NOT NULL,
    "samplingDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SoilSample_pkey" PRIMARY KEY ("id")
);

-- Create ClimateData table
CREATE TABLE IF NOT EXISTS "ClimateData" (
    "id" TEXT NOT NULL,
    "plotId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "meanTemperature" DOUBLE PRECISION NOT NULL,
    "totalRainfall" DOUBLE PRECISION NOT NULL,
    "evaporation" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ClimateData_pkey" PRIMARY KEY ("id")
);

-- Create ManagementPractice table
CREATE TABLE IF NOT EXISTS "ManagementPractice" (
    "id" TEXT NOT NULL,
    "plotId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "carbonInputs" DOUBLE PRECISION NOT NULL,
    "dpmRpmRatio" DOUBLE PRECISION NOT NULL,
    "soilCover" BOOLEAN NOT NULL,
    "fertilizerN" DOUBLE PRECISION NOT NULL,
    "livestockPresent" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ManagementPractice_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "Plot" ADD CONSTRAINT "Plot_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TreeSample" ADD CONSTRAINT "TreeSample_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES "Plot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CreditCalc" ADD CONSTRAINT "CreditCalc_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES "Plot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SoilSample" ADD CONSTRAINT "SoilSample_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES "Plot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ClimateData" ADD CONSTRAINT "ClimateData_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES "Plot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ManagementPractice" ADD CONSTRAINT "ManagementPractice_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES "Plot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
