import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeletionRequest } from './deletion-request.entity';
import { Repository } from 'typeorm';
import { RequestStatus } from './enums/request-status.enum';
import { Medico } from 'src/medico/medico.entity';
import { PacienteService } from 'src/paciente/paciente.service';
import { AmostraService } from 'src/amostra/amostra.service';
import { ItemType } from './enums/item-type.enum';
import { PaginationQueryDto } from 'src/shared/DTO/pagination-query.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(DeletionRequest)
    private deletionRequestRepository: Repository<DeletionRequest>,
    private pacienteService: PacienteService,
    private amostraService: AmostraService,
  ) {}

  async getPendingRequests(paginationQuery: PaginationQueryDto) {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [requests, totalItems] =
      await this.deletionRequestRepository.findAndCount({
        where: { status: RequestStatus.PENDENTE },
        relations: ['requester'],
        order: {
          createdAt: 'ASC',
        },
        skip: skip,
        take: limit,
      });

    const meta = {
      totalItems,
      itemCount: requests.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };

    return { items: requests, meta };
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
