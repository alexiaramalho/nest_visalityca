import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Paciente } from './paciente.entity';
import { Repository } from 'typeorm';
import { Medico } from 'src/medico/medico.entity';
import { RequestDeletionDTO } from 'src/admin/DTO/request-deletion.dto';
import { DeletionRequest } from 'src/admin/deletion-request.entity';
import { ItemType } from 'src/admin/enums/item-type.enum';

@Injectable()
export class PacienteService {
  constructor(
    @InjectRepository(Paciente)
    private pacienteRepository: Repository<Paciente>,

    @InjectRepository(DeletionRequest)
    private deletionRequestRepository: Repository<DeletionRequest>,
  ) {}

  async getSummaryList() {
    const query = this.pacienteRepository
      .createQueryBuilder('paciente')
      .leftJoin('paciente.amostras', 'amostra')
      .select([
        'paciente.nome AS nome_paciente',
        'paciente.cpf AS cpf',
        'paciente.dataCriacao AS data_criacao_paciente',
        'MAX(amostra.dataAtualizacao) AS ultima_atualizacao_exame',
        'COUNT(amostra.id) AS quantidade_exames',
      ])
      .groupBy('paciente.id')
      .getRawMany();

    return query;
  }

  async findDetailsByCpf(cpf: string, medicoLogado: Medico) {
    const cpfLimpo = cpf.replace(/\D/g, '');

    const paciente = await this.pacienteRepository.findOne({
      where: { cpf: cpfLimpo },
      relations: {
        amostras: {
          medico: true,
        },
      },
    });

    if (!paciente) {
      throw new NotFoundException(`Paciente com CPF ${cpf} não encontrado.`);
    }

    const resposta = {
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
          possivel_diagnostico: amostra.possivel_diagnostico,
          data_criacao: amostra.dataRegistro,
          data_atualizacao: amostra.dataAtualizacao,
          imageUrls: amostra.imageUrls,
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

  async findAllWithExams(medicoLogado: Medico) {
    const pacientes = await this.pacienteRepository.find({
      relations: {
        amostras: {
          medico: true,
        },
      },
    });

    const resposta = pacientes.map((paciente) => ({
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

    return resposta;
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
