import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Paciente } from './paciente.entity';
import { Repository } from 'typeorm';
import { Medico } from 'src/medico/medico.entity';
import { RequestDeletionDTO } from 'src/admin/DTO/request-deletion.dto';
import { DeletionRequest } from 'src/admin/deletion-request.entity';
import { ItemType } from 'src/admin/enums/item-type.enum';
import { PaginationQueryDto } from 'src/shared/DTO/pagination-query.dto';
import { Amostra } from 'src/amostra/amostra.entity';

@Injectable()
export class PacienteService {
  constructor(
    @InjectRepository(Paciente)
    private pacienteRepository: Repository<Paciente>,

    @InjectRepository(DeletionRequest)
    private deletionRequestRepository: Repository<DeletionRequest>,

    @InjectRepository(Amostra)
    private amostraRepository: Repository<Amostra>,
  ) {}

  async getSummaryList(paginationQuery: PaginationQueryDto) {
    const { page = 1, limit = 8 } = paginationQuery;
    const skip = (page - 1) * limit;

    const queryBuilder = this.pacienteRepository
      .createQueryBuilder('paciente')
      .leftJoin('paciente.amostras', 'amostra')
      .groupBy('paciente.id');

    const totalItems = await queryBuilder.getCount();

    const items = await queryBuilder
      .select([
        'paciente.nome AS nome_paciente',
        'paciente.cpf AS cpf',
        'paciente.dataCriacao AS data_criacao_paciente',
        'MAX(amostra.dataAtualizacao) AS ultima_atualizacao_exame',
        'COUNT(amostra.id) AS quantidade_exames',
      ])
      .orderBy('MAX(amostra.dataAtualizacao)', 'DESC')
      .offset(skip)
      .limit(limit)
      .getRawMany();

    const meta = {
      totalItems,
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };

    return { items, meta };
  }

  async findDetailsByCpf(
    cpf: string,
    paginationQuery: PaginationQueryDto,
    medicoLogado: Medico,
  ) {
    const { page = 1, limit = 3 } = paginationQuery;
    const skip = (page - 1) * limit;
    const cpfLimpo = cpf.replace(/\D/g, '');

    const paciente = await this.pacienteRepository.findOne({
      where: { cpf: cpfLimpo },
    });

    if (!paciente) {
      throw new NotFoundException(`Paciente com CPF ${cpf} não encontrado.`);
    }

    const [amostras, totalItems] = await this.amostraRepository.findAndCount({
      where: { paciente: { id: paciente.id } },
      relations: {
        medico: true,
      },
      order: {
        dataAtualizacao: 'DESC',
      },
      skip: skip,
      take: limit,
    });

    const resposta = {
      paciente: {
        id: paciente.id,
        cpf: paciente.cpf,
        nome: paciente.nome,
        dataNascimento: paciente.dataNascimento,
      },
      exames: {
        meta: {
          totalItems,
          itemCount: amostras.length,
          itemsPerPage: limit,
          totalPages: Math.ceil(totalItems / limit),
          currentPage: page,
        },
        lista: amostras.map((amostra) => ({
          id: amostra.id,
          nome_amostra: amostra.nome_amostra,
          numeroExame: amostra.numeroExame,
          medico: {
            id: amostra.medico.id,
            nome: amostra.medico.nome,
          },
          canEdit: amostra.medico.id === medicoLogado.id,
        })),
      },
    };

    return resposta;
  }

  async findAllWithExams(
    paginationQuery: PaginationQueryDto,
    medicoLogado: Medico,
  ) {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;
    const [pacientes, totalItems] = await this.pacienteRepository.findAndCount({
      relations: {
        amostras: {
          medico: true,
        },
      },
      order: {
        nome: 'ASC',
      },
      skip: skip,
      take: limit,
    });

    const items = pacientes.map((paciente) => ({
      paciente: {
        id: paciente.id,
        cpf: paciente.cpf,
        nome: paciente.nome,
        dataNascimento: paciente.dataNascimento,
      },
      exames: {
        qtd_total: paciente.amostras.length,
        lista: paciente.amostras.map((amostra) => ({
          id: amostra.id,
          nome_amostra: amostra.nome_amostra,
          numeroExame: amostra.numeroExame,
          imageUrls: amostra.imageUrls,
          medico: {
            id: amostra.medico.id,
            nome: amostra.medico.nome,
          },
          canEdit: amostra.medico.id === medicoLogado.id,
        })),
      },
    }));

    const meta = {
      totalItems,
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };

    return { items, meta };
  }

  async deleteById(id: string): Promise<void> {
    const result = await this.pacienteRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Paciente com ID ${id} não encontrado.`);
    }
  }

  async requestDeletion(
    cpf: string,
    dto: RequestDeletionDTO,
    requester: Medico,
  ): Promise<DeletionRequest> {
    const cpfLimpo = cpf.replace(/\D/g, '');
    const paciente = await this.pacienteRepository.findOneBy({ cpf: cpfLimpo });

    if (!paciente) {
      throw new NotFoundException(`Paciente com CPF ${cpf} não encontrado.`);
    }

    const request = this.deletionRequestRepository.create({
      itemId: paciente.id,
      itemType: ItemType.PACIENTE,
      requester,
      justificativa: dto.justificativa,
    });

    return this.deletionRequestRepository.save(request);
  }
}
