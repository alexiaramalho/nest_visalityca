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
    // 1. Busca a contagem de exames para os meses do ano atual
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

    // 2. Mapeia os resultados para uma busca rápida (chave: mês, valor: contagem)
    const contagemMap = new Map<number, number>();
    rawData.forEach((row) => {
      // Extrai o mês da data retornada
      const mes = new Date(row.month_date).getMonth() + 1;
      contagemMap.set(mes, parseInt(row.count, 10));
    });

    // 3. Gera a lista completa de meses do ano até a data atual
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1;

    const resultadoCompleto: { year: number; month: number; count: number }[] =
      [];

    for (let mes = 1; mes <= mesAtual; mes++) {
      resultadoCompleto.push({
        year: anoAtual,
        month: mes,
        // Usa a contagem do mapa ou 0 se o mês não tiver dados
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
