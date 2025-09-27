import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeletionRequest } from 'src/admin/deletion-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeletionRequest])],
  exports: [TypeOrmModule],
})
export class SharedModule {}
