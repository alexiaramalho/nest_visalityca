import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AmostraModule } from './amostra/amostra.module';
import { PacienteModule } from './paciente/paciente.module';
import { MedicoController } from './medico/medico.controller';
import { MedicoService } from './medico/medico.service';
import { MedicoModule } from './medico/medico.module';
import { Medico } from './medico/medico.entity';
import { Paciente } from './paciente/paciente.entity';
import { Amostra } from './amostra/amostra.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'visalityca_db',
      entities: [Medico, Paciente, Amostra],
      synchronize: true,
    }),
    AuthModule,
    AmostraModule,
    PacienteModule,
    MedicoModule,
  ],
  controllers: [MedicoController],
  providers: [MedicoService],
})
export class AppModule {}
