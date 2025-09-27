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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [Medico, Paciente, Amostra, DeletionRequest],
      synchronize: true,
    }),
    AuthModule,
    AmostraModule,
    PacienteModule,
    MedicoModule,
    FilesModule,
    AdminModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
