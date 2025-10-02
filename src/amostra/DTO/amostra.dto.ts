import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PacienteAmostraDTO } from '../../paciente/DTO/pacienteAmostra.dto';
import { Type } from 'class-transformer';

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

  @ApiProperty({
    description:
      'String da imagem em formato Base64 com prefixo de data URI (ex: data:image/jpeg;base64,...).',
    example: '[data:image/jpeg;base64,/9j/4AAQSkZJRg...]',
  })
  @IsArray()
  @IsString({ each: true })
  imagensBase64: string[];

  @ApiProperty({
    description: 'Data e hora do início da análise.',
    example: '2025-10-02T14:00:00.000Z',
  })
  @IsNotEmpty()
  @IsDateString()
  inicio_analise: Date;

  @ApiProperty({
    description:
      'Dados do paciente. Se o CPF já existir, o paciente será reutilizado. Se não, um novo será criado.',
    type: () => PacienteAmostraDTO,
  })
  @ValidateNested()
  @Type(() => PacienteAmostraDTO)
  paciente: PacienteAmostraDTO;
}
