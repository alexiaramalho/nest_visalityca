import { IsOptional, IsString } from 'class-validator';

export class SearchPacienteDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsString()
  nomeMedico?: string;
}
