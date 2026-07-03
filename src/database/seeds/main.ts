import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { SeedService } from './seed.service';

async function bootstrap() {
  const app = await NestFactory.create(SeedModule);
  const seedService = app.get(SeedService);

  try {
    await seedService.seed();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

void bootstrap();
