import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RequestDeletionDTO {
  @ApiProperty({
    description: 'Motivo pelo qual a exclusão está sendo solicitada.',
    example: 'Paciente cadastrado em duplicidade.',
  })
  @IsString()
  @IsNotEmpty({ message: 'A justificativa é obrigatória.' })
  @MinLength(10, {
    message: 'A justificativa deve ter pelo menos 10 caracteres.',
  })
  justificativa: string;
}
