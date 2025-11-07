import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AmostraModule } from './amostra/amostra.module';
import { PacienteModule } from './paciente/paciente.module';
import { MedicoModule } from './medico/medico.module';
import { Medico } from './medico/medico.entity';
import { Paciente } from './paciente/paciente.entity';
import { Amostra } from './amostra/amostra.entity';
import { ConfigModule } from '@nestjs/config';
import { FilesModule } from './files/files.module';
import { DeletionRequest } from './admin/deletion-request.entity';
import { AdminModule } from './admin/admin.module';
import { SeedModule } from './seed/seed.module';
import { Notification } from './notifications/notification.entity';
import { NotificationModule } from './notifications/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: false,
      entities: [Medico, Paciente, Amostra, DeletionRequest, Notification],
      synchronize: true,
    }),
    AuthModule,
    AmostraModule,
    PacienteModule,
    MedicoModule,
    FilesModule,
    AdminModule,
    SeedModule,
    NotificationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
