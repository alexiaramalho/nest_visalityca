import { Module } from '@nestjs/common';
import { PacienteService } from './paciente.service';
import { PacienteController } from './paciente.controller';

@Module({
  providers: [PacienteService],
  controllers: [PacienteController]
})
export class PacienteModule {}
