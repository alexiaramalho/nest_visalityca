import { forwardRef, Module } from '@nestjs/common';
import { AmostraController } from './amostra.controller';
import { AmostraService } from './amostra.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Amostra } from './amostra.entity';
import { Paciente } from 'src/paciente/paciente.entity';
import { Medico } from 'src/medico/medico.entity';
import { FilesModule } from 'src/files/files.module';
import { DeletionRequest } from 'src/admin/deletion-request.entity';
import { PacienteModule } from 'src/paciente/paciente.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Amostra, Medico, DeletionRequest, Paciente]),
    FilesModule,
    forwardRef(() => PacienteModule),
  ],
  controllers: [AmostraController],
  providers: [AmostraService],
  exports: [AmostraService, TypeOrmModule],
})
export class AmostraModule {}
