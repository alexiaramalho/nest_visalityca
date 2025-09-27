import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateAmostraDTO {
  @ApiProperty({
    description: 'Possível diagnóstico baseado na análise da amostra.',
    example: 'Lesão benigna',
    required: false,
  })
  @IsString()
  @IsOptional()
  possivel_diagnostico?: string;

  @ApiProperty({
    description: 'Observações adicionais do médico.',
    example: 'Recomenda-se acompanhamento em 6 meses.',
    required: false,
  })
  @IsString()
  @IsOptional()
  observacao?: string;
}
