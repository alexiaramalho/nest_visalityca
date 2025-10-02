import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module'; // Importe seu AppModule principal
import { SeedService } from './seed/seed.service';
import { SeedModule } from './seed/seed.module';

async function bootstrap() {
  // Crie um contexto de aplicação standalone
  const appContext = await NestFactory.createApplicationContext(AppModule);

  // Obtenha a instância do SeedService
  const seedService = appContext.select(SeedModule).get(SeedService);

  try {
    // Execute o método run
    await seedService.run();
    console.log('Script de seeding executado com sucesso.');
  } catch (error) {
    console.error('Ocorreu um erro durante o seeding:', error);
  } finally {
    // Feche a aplicação
    await appContext.close();
  }
}

bootstrap();
