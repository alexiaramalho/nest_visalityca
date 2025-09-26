import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegistroAmostraDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nome_amostra: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  comprimento: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  largura: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  altura: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  possivel_diagnostico: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  observacao: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  imagens: string;
}
