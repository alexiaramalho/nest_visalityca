import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  UseGuards,
  Request,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { AmostraService } from './amostra.service';
import { RegistroAmostraDTO } from './DTO/amostra.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { Amostra } from './amostra.entity';
import { AuthGuard } from '@nestjs/passport';
import type { RequestWithMedico } from 'src/auth/types/request-with-medico.interface';
import { UpdateAmostraDTO } from './DTO/update-amostra.dto';
import { RequestDeletionDTO } from 'src/admin/DTO/request-deletion.dto';
import { PaginationQueryDto } from 'src/shared/DTO/pagination-query.dto';

@Controller('amostras')
export class AmostraController {
  constructor(private readonly amostraService: AmostraService) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registra uma nova amostra no sistema' })
  @ApiResponse({
    status: 201,
    description: 'A amostra foi criada com sucesso.',
    type: Amostra,
  })
  @ApiResponse({
    status: 400,
    description: 'Os dados fornecidos são inválidos.',
  })
  async registrarAmostra(
    @Body() registroAmostraDTO: RegistroAmostraDTO,
    @Request() req: RequestWithMedico,
  ): Promise<Amostra> {
    const medicoLogado = req.user;

    return this.amostraService.registrarAmostra(
      registroAmostraDTO,
      medicoLogado,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lista a amostra cadastrada buscando pelo ID',
  })
  @Get('/:id')
  pegarAmostraPorId(@Param('id') id: string): Promise<Amostra> {
    return this.amostraService.pegarAmostraPorId(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualiza o diagnóstico ou observação de uma amostra',
  })
  @ApiResponse({ status: 200, description: 'Amostra atualizada com sucesso.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  @ApiResponse({ status: 404, description: 'Amostra não encontrada.' })
  async atualizarAmostra(
    @Param('id') id: string,
    @Body() updateAmostraDTO: UpdateAmostraDTO,
    @Request() req: RequestWithMedico,
  ) {
    const medicoLogado = req.user;
    return this.amostraService.atualizarAmostra(
      id,
      updateAmostraDTO,
      medicoLogado,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Solicita a exclusão de uma amostra com justificativa',
  })
  @ApiBody({ type: RequestDeletionDTO })
  requestAmostraDeletion(
    @Param('id') id: string,
    @Body() dto: RequestDeletionDTO,
    @Request() req: RequestWithMedico,
  ) {
    const medicoLogado = req.user;
    return this.amostraService.requestDeletion(id, dto, medicoLogado);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Lista todas as amostras cadastradas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de amostras retornada com sucesso.',
    type: [Amostra],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async buscarTodas(@Query() paginationQuery: PaginationQueryDto) {
    return this.amostraService.buscarTodas(paginationQuery);
  }
}
