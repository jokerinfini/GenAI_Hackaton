import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, { bufferLogs: true });
	
	// Enable CORS for frontend
	app.enableCors({
		origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
		credentials: true,
	});
	
	app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
	const port = process.env.PORT ? Number(process.env.PORT) : 3001;
	await app.listen(port);
	console.log(`🚀 API Server running on http://localhost:${port}`);
}
bootstrap();
