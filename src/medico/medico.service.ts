import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Medico } from './medico.entity';
import { Repository } from 'typeorm';
import { UserSignUpDTO } from './DTO/medico.dto';
import { Amostra } from 'src/amostra/amostra.entity';

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
    const rawData: MonthlyExamCount[] = await this.amostraRepository
      .createQueryBuilder('amostra')
      .select("DATE_TRUNC('month', amostra.dataRegistro)", 'month')
      .addSelect('COUNT(amostra.id)', 'count')
      .where('amostra.medico.id = :medicoId', { medicoId })
      .groupBy('month')
      .orderBy('month', 'DESC')
      .getRawMany();

    const formattedData = rawData.map((row) => ({
      year: new Date(row.month).getFullYear(),
      month: new Date(row.month).getMonth() + 1,
      count: parseInt(row.count, 10),
    }));

    return formattedData;
  }

  async create(userSignUpDTO: UserSignUpDTO): Promise<Medico> {
    const { username, role } = userSignUpDTO;

    const existsUser = await this.findByUsername(username);
    if (existsUser) {
      throw new BadRequestException('Este nome de usuário já está em uso.');
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
}
