import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeletionRequest } from 'src/admin/deletion-request.entity';
import { ItemType } from 'src/admin/enums/item-type.enum';
import { Medico } from './medico.entity';
import { NotificationService } from 'src/notifications/notification.service';

@Injectable()
export class DeletionRequestService {
  constructor(
    @InjectRepository(DeletionRequest)
    private deletionRequestRepository: Repository<DeletionRequest>,
    private notificationService: NotificationService,
  ) {}

  async createRequest(
    itemType: ItemType,
    itemId: string,
    justificativa: string,
    requester: Medico,
  ): Promise<DeletionRequest> {
    // Buscar nome do item
    let itemName = '';
    let itemTypeText = '';
    
    if (itemType === ItemType.PACIENTE) {
      // Assumindo que você tem acesso ao PacienteService
      itemName = 'Paciente'; // Pode buscar o nome real se necessário
      itemTypeText = 'paciente';
    } else if (itemType === ItemType.AMOSTRA) {
      itemName = 'Exame'; // Pode buscar o nome real se necessário
      itemTypeText = 'exame';
    }

    const request = this.deletionRequestRepository.create({
      itemType,
      itemId,
      justificativa,
      requester,
    });

    const savedRequest = await this.deletionRequestRepository.save(request);

    // Enviar notificação de criação
    this.notificationService.sendNotification({
      userId: requester.id,
      type: 'deletion_request_created',
      message: `Sua solicitação de exclusão do ${itemTypeText} foi enviada para análise`,
      data: { requestId: savedRequest.id, itemName, itemType: itemTypeText }
    });

    return savedRequest;
  }
}