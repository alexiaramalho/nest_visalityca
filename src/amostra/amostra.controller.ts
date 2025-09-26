import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
} from '@nestjs/common';
import { AmostraService } from './amostra.service';
import { RegistroAmostraDTO } from './DTO/amostra.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Amostra } from './amostra.entity';

@Controller('amostras')
export class AmostraController {
  constructor(private readonly amostraService: AmostraService) {}

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
  async registrar(
    @Body() registroAmostraDTO: RegistroAmostraDTO,
  ): Promise<Amostra> {
    return this.amostraService.registrarAmostra(registroAmostraDTO);
  }

  @Get('/:id')
  pegarAmostraPorId(@Param('id') id: string): Promise<Amostra> {
    return this.amostraService.pegarAmostraPorId(id);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as amostras cadastradas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de amostras retornada com sucesso.',
    type: [Amostra],
  })
  async buscarTodas(): Promise<Amostra[]> {
    return this.amostraService.buscarTodas();
  }
}
