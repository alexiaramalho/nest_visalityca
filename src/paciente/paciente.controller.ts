import { Controller, Get, Param, UseGuards, Request, Delete, Body } from '@nestjs/common';
import { PacienteService } from './paciente.service';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { RequestWithMedico } from 'src/auth/types/request-with-medico.interface';
import { PacienteSummaryDTO } from './DTO/paciente-sumario.dto';
import { RequestDeletionDTO } from 'src/admin/DTO/request-deletion.dto';

@ApiTags('Pacientes')
@Controller('pacientes')
export class PacienteController {
  constructor(private readonly pacienteService: PacienteService) {}
  @Get('tabela')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lista um resumo de todos os pacientes com a contagem de exames',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumo da lista de pacientes retornado com sucesso.',
    type: [PacienteSummaryDTO],
  })
  obterResumoLista() {
    return this.pacienteService.getSummaryList();
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Solicita a exclusão de um paciente' })
  @ApiParam({ name: 'id', description: 'ID do paciente (UUID)' })
  @ApiBody({ type: RequestDeletionDTO })
  @ApiResponse({
    status: 201,
    description: 'Solicitação de exclusão criada com sucesso.',
  })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado.' })
  requestDeletion(
    @Param('id') id: string,
    @Body() dto: RequestDeletionDTO,
    @Request() req: RequestWithMedico,
  ) {
    const medicoLogado = req.user;
    return this.pacienteService.requestDeletion(id, dto, medicoLogado);
  }

  @Get(':cpf')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Busca um paciente pelo CPF com todos os seus exames',
  })
  @ApiParam({
    name: 'cpf',
    description: 'CPF do paciente (com ou sem formatação)',
    example: '123.456.789-00',
  })
  @ApiResponse({
    status: 200,
    description: 'Paciente e exames encontrados com sucesso.',
  })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado.' })
  obterDetalhesPorCpf(
    @Param('cpf') cpf: string,
    @Request() req: RequestWithMedico,
  ) {
    const medicoLogado = req.user;
    return this.pacienteService.findDetailsByCpf(cpf, medicoLogado);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lista todos os pacientes com seus respectivos exames',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de pacientes e exames retornada com sucesso.',
  })
  listarTodosPacientes(@Request() req: RequestWithMedico) {
    const medicoLogado = req.user;
    return this.pacienteService.findAllWithExams(medicoLogado);
  }
}
