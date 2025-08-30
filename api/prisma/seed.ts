import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	// Upsert default agroforestry emission factor
	await prisma.emissionFactor.upsert({
		where: { name: 'agroforestry_default' },
		update: {},
		create: {
			name: 'agroforestry_default',
			a: 0.0673,
			b: 2.84,
			root_shoot_ratio: 0.24,
			carbon_fraction: 0.47,
			co2_conversion: 3.67,
		},
	});
	console.log('Seeded emission factors');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
