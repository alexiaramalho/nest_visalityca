import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeletionRequest } from './deletion-request.entity';
import { Repository } from 'typeorm';
import { RequestStatus } from './enums/request-status.enum';
import { Medico } from 'src/medico/medico.entity';
import { PacienteService } from 'src/paciente/paciente.service';
import { AmostraService } from 'src/amostra/amostra.service';
import { ItemType } from './enums/item-type.enum';
import { MedicoService } from 'src/medico/medico.service';
import { Role } from 'src/auth/enums/role.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(DeletionRequest)
    private deletionRequestRepository: Repository<DeletionRequest>,
    private pacienteService: PacienteService,
    private amostraService: AmostraService,
    private medicoService: MedicoService,
  ) {}

  async listMedicos(paginationQuery: any) {
    return this.medicoService.findAllByRole(Role.MEDICO, paginationQuery);
  }

  async listAdmins(paginationQuery: any) {
    return this.medicoService.findAllByRole(Role.ADMIN, paginationQuery);
  }

  async deleteUser(idToDelete: string, adminId: string) {
    if (idToDelete === adminId) {
      throw new ForbiddenException('Você não pode excluir sua própria conta.');
    }
    await this.medicoService.deleteById(idToDelete);
  }

  async getPendingPatientRequests(paginationQuery: any) {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const queryBuilder = this.deletionRequestRepository
      .createQueryBuilder('request')
      .innerJoin('request.requester', 'requester')
      .innerJoin('tb_pacientes', 'paciente', 'paciente.id = request.itemId')
      .where('request.status = :status', { status: RequestStatus.PENDENTE })
      .andWhere('request.itemType = :itemType', {
        itemType: ItemType.PACIENTE,
      });

    const totalItems = await queryBuilder.getCount();
    const requests = await queryBuilder
      .addSelect(['requester.nome', 'requester.crm'])
      .orderBy('request.createdAt', 'ASC')
      .skip(skip)
      .take(limit)
      .getMany();

    const formattedRequests: any[] = [];
    for (const request of requests) {
      const paciente = await this.pacienteService.findById(request.itemId);
      if (paciente) {
        formattedRequests.push({
          idSolicitacao: request.id,
          idPaciente: paciente.id,
          nomePaciente: paciente.nome,
          cpf: paciente.cpf,
          dataSolicitacao: request.createdAt,
          solicitante: {
            nome: request.requester.nome,
            crm: request.requester.crm,
          },
          justificativa: {
            texto: request.justificativa,
          },
          status: request.status,
        });
      }
    }

    const meta = {
      totalItems,
      itemCount: formattedRequests.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };

    return { items: formattedRequests, meta };
  }

  async getPendingExamRequests(paginationQuery: any) {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const queryBuilder = this.deletionRequestRepository
      .createQueryBuilder('request')
      .innerJoin('request.requester', 'requester')
      .innerJoin('tb_amostras', 'amostra', 'amostra.id = request.itemId')
      .where('request.status = :status', { status: RequestStatus.PENDENTE })
      .andWhere('request.itemType = :itemType', { itemType: ItemType.AMOSTRA });

    const totalItems = await queryBuilder.getCount();
    const requests = await queryBuilder
      .addSelect(['requester.nome', 'requester.crm'])
      .orderBy('request.createdAt', 'ASC')
      .skip(skip)
      .take(limit)
      .getMany();

    const formattedRequests: any[] = [];
    for (const request of requests) {
      let amostra;
      try {
        amostra = await this.amostraService.pegarAmostraPorId(request.itemId);
      } catch (error) {
        if (error instanceof NotFoundException) {
          console.warn(
            `Solicitação de exclusão ${request.id} encontrada para um exame (ID: ${request.itemId}) que não existe mais. Ignorando.`,
          );
          continue;
        }
        throw error;
      }

      if (amostra && amostra.paciente) {
        formattedRequests.push({
          idSolicitacao: request.id,
          idPaciente: amostra.paciente.id,
          nomePaciente: amostra.paciente.nome,
          cpf: amostra.paciente.cpf,
          dataSolicitacao: request.createdAt,
          solicitante: {
            nome: request.requester.nome,
            crm: request.requester.crm,
          },
          exame: {
            id: amostra.id,
            nomePeca: amostra.nome_amostra,
          },
          justificativa: {
            texto: request.justificativa,
          },
          status: request.status,
        });
      }
    }

    const meta = {
      totalItems,
      itemCount: formattedRequests.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };

    return { items: formattedRequests, meta };
  }

  async reviewRequest(
    id: string,
    approve: boolean,
    reviewer: Medico,
  ): Promise<DeletionRequest> {
    const request = await this.deletionRequestRepository.findOneBy({ id });
    if (!request) {
      throw new NotFoundException('Solicitação não encontrada.');
    }
    if (request.status !== RequestStatus.PENDENTE) {
      throw new BadRequestException('Esta solicitação já foi revisada.');
    }

    if (approve) {
      if (request.itemType === ItemType.PACIENTE) {
        await this.pacienteService.deleteById(request.itemId);
      } else if (request.itemType === ItemType.AMOSTRA) {
        await this.amostraService.deleteById(request.itemId);
      }
      request.status = RequestStatus.APROVADO;
    } else {
      request.status = RequestStatus.RECUSADO;
    }

    request.reviewer = reviewer;
    return this.deletionRequestRepository.save(request);
  }
}
