import { forwardRef, Module } from '@nestjs/common';
import { PacienteService } from './paciente.service';
import { PacienteController } from './paciente.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Paciente } from './paciente.entity';
import { SharedModule } from 'src/shared/shared.module';
import { AmostraModule } from 'src/amostra/amostra.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Paciente]),
    SharedModule,
    forwardRef(() => AmostraModule),
  ],
  controllers: [PacienteController],
  providers: [PacienteService],
  exports: [PacienteService],
})
export class PacienteModule {}
