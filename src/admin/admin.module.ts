import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeletionRequest } from './deletion-request.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PacienteModule } from 'src/paciente/paciente.module';
import { AmostraModule } from 'src/amostra/amostra.module';
import { MedicoModule } from 'src/medico/medico.module';
import { SharedModule } from 'src/shared/shared.module';
import { NotificationModule } from 'src/notifications/notification.module';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([DeletionRequest]),
    forwardRef(() => PacienteModule),
    forwardRef(() => AmostraModule),
    forwardRef(() => MedicoModule),
    NotificationModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
