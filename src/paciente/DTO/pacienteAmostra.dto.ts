import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class PacienteAmostraDTO {
  @IsOptional()
  @IsUUID('4', { message: 'O ID do paciente deve ser um UUID válido.' })
  id?: string;

  @ApiProperty({
    description: 'Nome completo do paciente.',
    example: 'João da Silva',
  })
  @IsNotEmpty({ message: 'O nome do paciente é obrigatório ao criar um novo.' })
  @IsString()
  nome: string;

  @ApiProperty({
    description:
      'CPF único do paciente. Usado para encontrar ou criar o paciente.',
    example: '123.456.789-00',
  })
  @IsString({ message: 'O CPF deve ser uma string.' })
  @IsNotEmpty({ message: 'O CPF do paciente é obrigatório.' })
  cpf: string;

  @ApiProperty({
    description: 'Data de nascimento do paciente no formato AAAA-MM-DD.',
    example: '1990-12-31',
  })
  @IsDateString()
  @IsNotEmpty()
  dataNascimento: Date;
}
