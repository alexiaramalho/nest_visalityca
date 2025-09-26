import { Module } from '@nestjs/common';
import { AmostraController } from './amostra.controller';
import { AmostraService } from './amostra.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Amostra } from './amostra.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Amostra])],
  controllers: [AmostraController],
  providers: [AmostraService],
})
export class AmostraModule {}
