import { ApiProperty } from '@nestjs/swagger';

export class PacienteSummaryDTO {
  @ApiProperty({ example: 'João da Silva' })
  nome_paciente: string;

  @ApiProperty({ example: '12345678900' })
  cpf: string;

  @ApiProperty({ example: '2025-09-27T10:00:00.000Z' })
  ultima_atualizacao_exame: Date;

  @ApiProperty({ example: '2025-09-25T08:30:00.000Z' })
  data_criacao_paciente: Date;

  @ApiProperty({ example: 5 })
  quantidade_exames: number;
}
