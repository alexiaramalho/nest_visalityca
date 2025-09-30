import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MedicoService } from './medico.service';
import type { RequestWithMedico } from 'src/auth/types/request-with-medico.interface';
import { Role } from 'src/auth/enums/role.enum';

@ApiTags('Medicos')
@Controller('medicos')
export class MedicoController {
  constructor(private readonly medicoService: MedicoService) {}

  @Get(':id/stats/monthly-count')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retorna a contagem mensal de exames de um médico' })
  async getMonthlyStats(
    @Param('id') id: string,
    @Request() req: RequestWithMedico,
  ) {
    const medicoLogado = req.user;

    if (medicoLogado.role !== Role.ADMIN && medicoLogado.id !== id) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar estas informações.',
      );
    }

    return this.medicoService.getMonthlyExamCount(id);
  }
}
