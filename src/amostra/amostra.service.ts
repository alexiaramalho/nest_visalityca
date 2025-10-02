import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Amostra } from './amostra.entity';
import { Repository } from 'typeorm';
import { RegistroAmostraDTO } from './DTO/amostra.dto';
import { validate } from 'uuid';
import { Paciente } from '../paciente/paciente.entity';
import { Medico } from '../medico/medico.entity';
import { S3Service } from 'src/files/s3.service';
import { UpdateAmostraDTO } from './DTO/update-amostra.dto';
import { DeletionRequest } from 'src/admin/deletion-request.entity';
import { ItemType } from 'src/admin/enums/item-type.enum';
import { RequestDeletionDTO } from 'src/admin/DTO/request-deletion.dto';
import { PaginationQueryDto } from 'src/shared/DTO/pagination-query.dto';

interface MediaTempoRaw {
  ano: string;
  mes: string;
  media_tempo_minutos: string;
}

export interface MediaTempoDTO {
  ano: number;
  mes: number;
  mediaTempoMinutos: number;
}

@Injectable()
export class AmostraService {
  constructor(
    @InjectRepository(Amostra)
    private amostraRepository: Repository<Amostra>,

    @InjectRepository(Paciente)
    private pacienteRepository: Repository<Paciente>,

    @InjectRepository(DeletionRequest)
    private deletionRequestRepository: Repository<DeletionRequest>,

    private readonly s3Service: S3Service,
  ) {}

  async registrarAmostra(
    registroAmostraDTO: RegistroAmostraDTO,
    medicoLogado: Medico,
  ): Promise<Amostra> {
    const {
      paciente: dadosPaciente,
      imagensBase64,
      inicio_analise,
      ...dadosAmostra
    } = registroAmostraDTO;

    const fim_analise = new Date();

    let tempoTotal: number | undefined = undefined;
    if (inicio_analise && fim_analise) {
      const inicio = new Date(inicio_analise).getTime();
      const fim = new Date(fim_analise).getTime();

      const diferencaEmMs = Math.abs(fim - inicio);

      const diferencaEmMinutos = diferencaEmMs / (1000 * 60);

      tempoTotal = parseFloat(diferencaEmMinutos.toFixed(2));
    }

    let pacienteFinal = await this.pacienteRepository.findOneBy({
      cpf: dadosPaciente.cpf.replace(/\D/g, ''),
    });
    if (!pacienteFinal) {
      const dadosNovoPaciente = { ...dadosPaciente };
      dadosNovoPaciente.cpf = dadosNovoPaciente.cpf.replace(/\D/g, '');
      const novoPaciente = this.pacienteRepository.create(dadosNovoPaciente);
      pacienteFinal = await this.pacienteRepository.save(novoPaciente);
    }

    const contagemExamesAnteriores = await this.amostraRepository.count({
      where: {
        paciente: { id: pacienteFinal.id },
      },
    });

    const novaAmostra = this.amostraRepository.create({
      ...dadosAmostra,
      inicio_analise,
      fim_analise,
      tempo_total_analise: tempoTotal,
      paciente: pacienteFinal,
      medico: medicoLogado,
      numeroExame: contagemExamesAnteriores + 1,
      dataRegistro: new Date(),
      dataAtualizacao: new Date(),
    });

    if (imagensBase64 && imagensBase64.length > 0) {
      const uploadPromises = imagensBase64.map((base64String) => {
        const matches = base64String.match(/^data:(.+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          throw new BadRequestException(
            'Formato de imagem Base64 inválido na lista.',
          );
        }

        const mimeType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');

        return this.s3Service.uploadFile(buffer, mimeType);
      });

      const urls = await Promise.all(uploadPromises);
      novaAmostra.imageUrls = urls;
    }

    return this.amostraRepository.save(novaAmostra);
  }

  async calcularMediaTempoPorMes(
    medicoLogado: Medico,
  ): Promise<MediaTempoDTO[]> {
    // 1. Busca no banco apenas os meses do ano atual que possuem dados
    const mediaTempoFromDB: MediaTempoRaw[] = await this.amostraRepository
      .createQueryBuilder('amostra')
      .select('EXTRACT(YEAR FROM amostra.fim_analise)', 'ano')
      .addSelect('EXTRACT(MONTH FROM amostra.fim_analise)', 'mes')
      .addSelect('AVG(amostra.tempo_total_analise)', 'media_tempo_minutos')
      .where('amostra.tempo_total_analise IS NOT NULL')
      .andWhere('amostra.id_medico = :medicoId', { medicoId: medicoLogado.id })
      .andWhere(
        'EXTRACT(YEAR FROM amostra.fim_analise) = EXTRACT(YEAR FROM CURRENT_DATE)',
      )
      .groupBy('ano, mes')
      .getRawMany();

    // 2. Mapeia os resultados para uma busca rápida (chave: mês, valor: média)
    const mediaMap = new Map<number, number>();
    mediaTempoFromDB.forEach((item) => {
      mediaMap.set(
        Number(item.mes),
        parseFloat(Number(item.media_tempo_minutos).toFixed(2)),
      );
    });

    // 3. Gera a lista completa de meses do ano até a data atual
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1; // getMonth() retorna 0-11, então +1

    const resultadoCompleto: MediaTempoDTO[] = [];

    for (let mes = 1; mes <= mesAtual; mes++) {
      resultadoCompleto.push({
        ano: anoAtual,
        mes: mes,
        // Usa a média do mapa ou 0 se o mês não tiver dados
        mediaTempoMinutos: mediaMap.get(mes) || 0,
      });
    }

    return resultadoCompleto;
  }

  async requestDeletion(
    id: string,
    dto: RequestDeletionDTO,
    requester: Medico,
  ): Promise<DeletionRequest> {
    const amostra = await this.amostraRepository.findOneBy({ id });
    if (!amostra) {
      throw new NotFoundException(`Amostra com ID ${id} não encontrada.`);
    }

    const request = this.deletionRequestRepository.create({
      itemId: id,
      itemType: ItemType.AMOSTRA,
      requester,
      justificativa: dto.justificativa,
    });

    return this.deletionRequestRepository.save(request);
  }

  async atualizarAmostra(
    id: string,
    updateAmostraDTO: UpdateAmostraDTO,
    medicoLogado: Medico,
  ): Promise<Amostra> {
    const amostra = await this.amostraRepository.findOne({
      where: { id },
      relations: ['medico'],
    });

    if (!amostra) {
      throw new NotFoundException(`Amostra com ID ${id} não encontrada.`);
    }

    if (amostra.medico.id !== medicoLogado.id) {
      throw new ForbiddenException(
        'Você não tem permissão para editar esta amostra.',
      );
    }

    Object.assign(amostra, updateAmostraDTO);

    amostra.dataAtualizacao = new Date();

    return this.amostraRepository.save(amostra);
  }

  async pegarAmostraPorId(id: string) {
    if (!validate(id)) {
      throw new NotFoundException('ID de amostra inválido.');
    }
    const found = await this.amostraRepository.findOne({
      where: { id },
      relations: ['paciente', 'medico'],
    });
    if (!found) {
      throw new NotFoundException('Amostra não encontrada.');
    }
    return found;
  }

  async buscarTodas(paginationQuery: PaginationQueryDto) {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [amostras, totalItems] = await this.amostraRepository.findAndCount({
      relations: ['paciente', 'medico'],
      order: {
        dataAtualizacao: 'DESC',
      },
      skip: skip,
      take: limit,
    });

    const meta = {
      totalItems,
      itemCount: amostras.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };

    return { items: amostras, meta };
  }

  async deleteById(id: string): Promise<void> {
    const amostra = await this.amostraRepository.findOneBy({ id });
    if (!amostra) {
      console.warn(
        `Tentativa de deletar amostra com ID ${id} que não foi encontrada.`,
      );
      return;
    }

    if (amostra.imageUrls && amostra.imageUrls.length > 0) {
      const deletePromises = amostra.imageUrls.map((url) =>
        this.s3Service.deleteFile(url),
      );
      await Promise.all(deletePromises);
    }
    await this.amostraRepository.delete(id);
  }
}
