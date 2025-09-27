import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import { EnvironmentVariables } from 'src/config/environment-variables.interface';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {
    const region = this.configService.get('AWS_REGION', { infer: true });
    const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID', {
      infer: true,
    });
    const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY', {
      infer: true,
    });

    if (!region || !accessKeyId || !secretAccessKey) {
      throw new InternalServerErrorException(
        'Credenciais da AWS não configuradas no .env',
      );
    }

    this.s3Client = new S3Client({
      region: region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });
  }

  async uploadFile(fileBuffer: Buffer, mimeType: string): Promise<string> {
    const bucketName = this.configService.get('AWS_S3_BUCKET_NAME', {
      infer: true,
    });
    if (!bucketName) {
      throw new InternalServerErrorException(
        'Nome do bucket S3 não configurado no .env',
      );
    }

    const fileExtension = mimeType.split('/')[1];
    const fileName = `${uuid()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: fileBuffer,
      ContentType: mimeType,
    });

    await this.s3Client.send(command);

    return `https://${bucketName}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${fileName}`;
  }
  async deleteFile(fileUrl: string): Promise<void> {
    const bucketName = this.configService.get('AWS_S3_BUCKET_NAME', {
      infer: true,
    });
    const key = fileUrl.split('/').pop();

    if (!bucketName || !key) {
      throw new InternalServerErrorException(
        'Não foi possível extrair dados para deletar o arquivo do S3.',
      );
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      });
      await this.s3Client.send(command);
    } catch (error) {
      console.error('Error deleting from S3:', error);
    }
  }
}
