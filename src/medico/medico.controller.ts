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

  @Get('stats/monthly-count')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retorna a contagem mensal de exames do médico logado',
  })
  async getMyMonthlyStats(@Request() req: RequestWithMedico) {
    const medicoLogado = req.user;

    return this.medicoService.getMonthlyExamCount(medicoLogado.id);
  }

  @Get('stats/global-monthly-count')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retorna a contagem mensal de exames de TODOS os médicos',
  })
  async getGlobalMonthlyStats() {
    return this.medicoService.getGlobalMonthlyExamCount();
  }
}
