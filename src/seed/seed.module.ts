import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { Paciente } from '../paciente/paciente.entity';
import { Medico } from '../medico/medico.entity';
import { Amostra } from '../amostra/amostra.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Amostra, Paciente, Medico])],
  providers: [SeedService],
})
export class SeedModule {}
