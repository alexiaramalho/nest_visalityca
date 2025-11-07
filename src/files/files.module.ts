import { Module } from '@nestjs/common';
import { LocalFilesService } from './local-files.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [LocalFilesService],
  exports: [LocalFilesService],
})
export class FilesModule {}
