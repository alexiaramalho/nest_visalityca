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
import { PacienteService } from 'src/paciente/paciente.service'; // Assumindo que você tem PacienteService
import { AmostraService } from 'src/amostra/amostra.service'; // Assumindo que você tem AmostraService
import { ItemType } from './enums/item-type.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(DeletionRequest)
    private deletionRequestRepository: Repository<DeletionRequest>,
    private pacienteService: PacienteService,
    private amostraService: AmostraService,
  ) {}

  async getPendingRequests(): Promise<DeletionRequest[]> {
    return this.deletionRequestRepository.find({
      where: { status: RequestStatus.PENDENTE },
      relations: ['requester'],
    });
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
