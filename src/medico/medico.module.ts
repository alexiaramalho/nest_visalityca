import { Module, forwardRef } from '@nestjs/common'; // 1. Importe forwardRef
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicoService } from './medico.service';
import { MedicoController } from './medico.controller';
import { Medico } from './medico.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Medico]), forwardRef(() => AuthModule)],
  controllers: [MedicoController],
  providers: [MedicoService],
  exports: [MedicoService, TypeOrmModule],
})
export class MedicoModule {}
