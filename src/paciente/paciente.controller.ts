import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  Delete,
  Body,
  Query,
} from '@nestjs/common';
import { PacienteService } from './paciente.service';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { RequestWithMedico } from 'src/auth/types/request-with-medico.interface';
import { PacienteSummaryDTO } from './DTO/paciente-sumario.dto';
import { RequestDeletionDTO } from 'src/admin/DTO/request-deletion.dto';
import { PaginationQueryDto } from 'src/shared/DTO/pagination-query.dto';

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
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description:
      'Termo para buscar por nome do paciente, CPF ou nome do médico.',
  })
  obterResumoLista(
    @Query() paginationQuery: PaginationQueryDto,
    @Query('search') search?: string,
  ) {
    return this.pacienteService.getSummaryList(paginationQuery, search);
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
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  listarTodosPacientes(
    @Query() paginationQuery: PaginationQueryDto,
    @Request() req: RequestWithMedico,
  ) {
    const medicoLogado = req.user;
    return this.pacienteService.findAllWithExams(paginationQuery, medicoLogado);
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
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  obterDetalhesPorCpf(
    @Param('cpf') cpf: string,
    @Query() paginationQuery: PaginationQueryDto,
    @Request() req: RequestWithMedico,
  ) {
    const medicoLogado = req.user;
    return this.pacienteService.findDetailsByCpf(
      cpf,
      paginationQuery,
      medicoLogado,
    );
  }

  @Delete(':cpf')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Solicita a exclusão de um paciente' })
  @ApiParam({ name: 'cpf', description: 'cpf do paciente' })
  @ApiBody({ type: RequestDeletionDTO })
  @ApiResponse({
    status: 201,
    description: 'Solicitação de exclusão criada com sucesso.',
  })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado.' })
  requestDeletion(
    @Param('cpf') cpf: string,
    @Body() dto: RequestDeletionDTO,
    @Request() req: RequestWithMedico,
  ) {
    const medicoLogado = req.user;
    return this.pacienteService.requestDeletion(cpf, dto, medicoLogado);
  }
}
