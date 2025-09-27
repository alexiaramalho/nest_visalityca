import { Module } from '@nestjs/common';
import { AmostraController } from './amostra.controller';
import { AmostraService } from './amostra.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Amostra } from './amostra.entity';
import { Paciente } from 'src/paciente/paciente.entity';
import { Medico } from 'src/medico/medico.entity';
import { FilesModule } from 'src/files/files.module';
import { DeletionRequest } from 'src/admin/deletion-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Amostra, Paciente, Medico, DeletionRequest]),
    FilesModule,
  ],
  controllers: [AmostraController],
  providers: [AmostraService],
  exports: [AmostraService],
})
export class AmostraModule {}
