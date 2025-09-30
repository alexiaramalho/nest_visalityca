import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicoService } from './medico.service';
import { MedicoController } from './medico.controller';
import { Medico } from './medico.entity';
import { AuthModule } from 'src/auth/auth.module';
import { AmostraModule } from 'src/amostra/amostra.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Medico]),
    forwardRef(() => AuthModule),
    forwardRef(() => AmostraModule),
  ],
  controllers: [MedicoController],
  providers: [MedicoService],
  exports: [MedicoService, TypeOrmModule],
})
export class MedicoModule {}
