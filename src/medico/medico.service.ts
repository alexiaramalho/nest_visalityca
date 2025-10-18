import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Medico } from './medico.entity';
import { Repository } from 'typeorm';
import { UserSignUpDTO } from './DTO/medico.dto';
import { Amostra } from 'src/amostra/amostra.entity';
import { Role } from 'src/auth/enums/role.enum';

interface MonthlyExamCount {
  month: string;
  count: string;
}

@Injectable()
export class MedicoService {
  constructor(
    @InjectRepository(Medico)
    private readonly medicoRepository: Repository<Medico>,
    @InjectRepository(Amostra)
    private readonly amostraRepository: Repository<Amostra>,
  ) {}

  async getMonthlyExamCount(
    medicoId: string,
  ): Promise<{ year: number; month: number; count: number }[]> {
    const rawData: { month_date: string; count: string }[] =
      await this.amostraRepository
        .createQueryBuilder('amostra')
        .select("DATE_TRUNC('month', amostra.dataRegistro)", 'month_date')
        .addSelect('COUNT(amostra.id)', 'count')
        .where('amostra.medico.id = :medicoId', { medicoId })
        .andWhere(
          'EXTRACT(YEAR FROM amostra.dataRegistro) = EXTRACT(YEAR FROM CURRENT_DATE)',
        )
        .groupBy('month_date')
        .getRawMany();

    const contagemMap = new Map<number, number>();
    rawData.forEach((row) => {
      const mes = new Date(row.month_date).getMonth() + 1;
      contagemMap.set(mes, parseInt(row.count, 10));
    });

    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1;

    const resultadoCompleto: { year: number; month: number; count: number }[] =
      [];

    for (let mes = 1; mes <= mesAtual; mes++) {
      resultadoCompleto.push({
        year: anoAtual,
        month: mes,
        count: contagemMap.get(mes) || 0,
      });
    }

    return resultadoCompleto;
  }

  async getGlobalMonthlyExamCount(): Promise<
    { year: number; month: number; visalytica: number; manual: number }[]
  > {
    const rawData: MonthlyExamCount[] = await this.amostraRepository
      .createQueryBuilder('amostra')
      .select("DATE_TRUNC('month', amostra.dataRegistro)", 'month')
      .addSelect('COUNT(amostra.id)', 'count')
      .groupBy('month')
      .orderBy('month', 'DESC')
      .getRawMany();

    const formattedData = rawData.map((row) => {
      const visalyticaCount = parseInt(row.count, 10);

      const manualCount = Math.floor(visalyticaCount / 2.5);

      return {
        year: new Date(row.month).getFullYear(),
        month: new Date(row.month).getMonth() + 1,
        visalytica: visalyticaCount,
        manual: manualCount,
      };
    });

    return formattedData;
  }

  async create(userSignUpDTO: UserSignUpDTO): Promise<Medico> {
    const { username, cpf, crm } = userSignUpDTO;

    const errors: string[] = [];

    const [existingUsername, existingCpf, existingCrm] = await Promise.all([
      this.medicoRepository.findOne({ where: { username } }),
      this.medicoRepository.findOne({ where: { cpf } }),
      crm
        ? this.medicoRepository.findOne({ where: { crm } })
        : Promise.resolve(null),
    ]);

    if (existingUsername) {
      errors.push('Este nome de usuário já está em uso.');
    }
    if (existingCpf) {
      errors.push('Este CPF já está cadastrado.');
    }
    if (existingCrm) {
      errors.push('Este CRM já está cadastrado.');
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const user = this.medicoRepository.create(userSignUpDTO);

    return this.medicoRepository.save(user);
  }

  async findByUsername(username: string): Promise<Medico | null> {
    return this.medicoRepository
      .createQueryBuilder('medico')
      .addSelect('medico.senha')
      .where('medico.username = :username', { username })
      .getOne();
  }

  async findById(id: string): Promise<Medico | null> {
    return this.medicoRepository.findOneBy({ id });
  }

  async findAllByRole(
    role: Role,
    paginationQuery: any,
  ): Promise<{ items: Medico[]; meta: any }> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [medicos, totalItems] = await this.medicoRepository.findAndCount({
      where: { role },
      order: { nome: 'ASC' },
      skip,
      take: limit,
    });

    const meta = {
      totalItems,
      itemCount: medicos.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };

    return { items: medicos, meta };
  }

  async deleteById(id: string): Promise<void> {
    const result = await this.medicoRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }
  }
}
