import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LocalFilesService {
  private readonly uploadsPath: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadsPath = this.configService.get('UPLOADS_PATH') || './uploads';
    this.baseUrl = this.configService.get('BASE_URL') || 'http://localhost:3001';
    
    // Criar diretório de uploads se não existir
    if (!fs.existsSync(this.uploadsPath)) {
      fs.mkdirSync(this.uploadsPath, { recursive: true });
    }
  }

  async uploadFile(fileBuffer: Buffer, mimeType: string): Promise<string> {
    try {
      const fileExtension = mimeType.split('/')[1];
      const fileName = `${uuid()}.${fileExtension}`;
      const filePath = path.join(this.uploadsPath, fileName);

      fs.writeFileSync(filePath, fileBuffer);

      return `${this.baseUrl}/uploads/${fileName}`;
    } catch (error) {
      throw new InternalServerErrorException('Erro ao salvar arquivo localmente');
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const fileName = fileUrl.split('/').pop();
      if (!fileName) return;

      const filePath = path.join(this.uploadsPath, fileName);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
    }
  }
}