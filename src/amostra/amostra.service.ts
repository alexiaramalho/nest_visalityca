import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Amostra } from './amostra.entity';
import { Repository } from 'typeorm';
import { RegistroAmostraDTO } from './DTO/amostra.dto';
import { v4 as uuid, validate } from 'uuid';

@Injectable()
export class AmostraService {
  constructor(
    @InjectRepository(Amostra)
    private amostraRepository: Repository<Amostra>,
  ) {}

  async registrarAmostra(
    registroAmostraDTO: RegistroAmostraDTO,
  ): Promise<Amostra> {
    const novaAmostra = this.amostraRepository.create({
      ...registroAmostraDTO,
    });

    return this.amostraRepository.save(novaAmostra);
  }

  async pegarAmostraPorId(id: string) {
    if (!validate(id)) {
      throw new NotFoundException('exame não encontrado');
    }
    const found = await this.amostraRepository.findOne({ where: { id } });
    if (!found) {
      throw new NotFoundException('exame não encontrado');
    }
    return found;
  }

  async buscarTodas(): Promise<Amostra[]> {
    return this.amostraRepository.find();
  }
}
