import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faker, pt_BR } from '@faker-js/faker';

import { Paciente } from '../paciente/paciente.entity';
import { Medico } from '../medico/medico.entity';
import { Amostra } from '../amostra/amostra.entity';

const faker = new Faker({ locale: [pt_BR] });

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Amostra)
    private readonly amostraRepository: Repository<Amostra>,
    @InjectRepository(Paciente)
    private readonly pacienteRepository: Repository<Paciente>,
    @InjectRepository(Medico)
    private readonly medicoRepository: Repository<Medico>,
  ) { }

  async run() {
    console.log('Iniciando o processo de seeding...');
    // await this.cleanDatabase();
    await this.populateDatabase();
    console.log('Seeding concluído com sucesso!');
  }

  // private async cleanDatabase() {
  //   console.log('Limpando tabelas com CASCADE...');
  //   await this.amostraRepository.query(
  //     'TRUNCATE TABLE "tb_amostras", "tb_pacientes", "tb_medicos" RESTART IDENTITY CASCADE;',
  //   );

  //   console.log('Tabelas limpas.');
  // }

  // ...

  private async populateDatabase() {
    console.log('Povoando o banco de dados com novos dados...');

    // ETAPA 1: BUSCAR O MÉDICO ESPECÍFICO
    const usernameDoMedico = '12345SP';
    const medicoResponsavel = await this.medicoRepository.findOneBy({
      username: usernameDoMedico,
    });

    if (!medicoResponsavel) {
      console.error(`ERRO: Médico com username "${usernameDoMedico}" não foi encontrado.`);
      console.error('Por favor, verifique se o username está correto ou crie o médico antes de rodar o seed.');
      return;
    }

    console.log(`Todas as amostras serão atribuídas ao Dr(a). ${medicoResponsavel.nome}`);

    // ETAPA 2: CRIAR PACIENTENTES E AMOSTRAS
    const dataInicioRange = new Date('2025-05-01T00:00:00.000Z');
    const dataFimRange = new Date();

    for (let i = 0; i < 20; i++) {
      const pacienteData = {
        nome: faker.person.fullName(),
        cpf: faker.string.numeric(11),
        dataNascimento: faker.date.birthdate(),
      };
      const paciente = this.pacienteRepository.create(pacienteData);
      const savedPaciente = await this.pacienteRepository.save(paciente);

      const numeroDeAmostrasParaEstePaciente = faker.number.int({ min: 1, max: 5 });
      console.log(`Criando ${numeroDeAmostrasParaEstePaciente} amostra(s) para o paciente ${savedPaciente.nome}...`);

      for (let j = 0; j < numeroDeAmostrasParaEstePaciente; j++) {
        const inicio = faker.date.between({ from: dataInicioRange, to: dataFimRange });
        const duracaoEmMs = faker.number.int({ min: 60000, max: 300000 });
        const fim = new Date(inicio.getTime() + duracaoEmMs);
        const tempoTotalMin = parseFloat(((fim.getTime() - inicio.getTime()) / 60000).toFixed(2));

        const amostra = this.amostraRepository.create({
          numeroExame: j + 1,
          nome_amostra: `Amostra #${j + 1} de ${savedPaciente.nome.split(' ')[0]}`,
          comprimento: `${faker.number.float({ min: 1, max: 10 })}`,
          largura: `${faker.number.float({ min: 1, max: 10 })}`,
          altura: `${faker.number.float({ min: 1, max: 10 })}`,
          possivel_diagnostico: faker.lorem.sentence(),
          observacao: faker.lorem.paragraph(),
          inicio_analise: inicio,
          fim_analise: fim,
          tempo_total_analise: tempoTotalMin,
          paciente: savedPaciente,
          medico: medicoResponsavel,

          // 👇 ADICIONE ESTAS DUAS LINHAS QUE ESTAVAM FALTANDO
          dataRegistro: inicio,
          dataAtualizacao: inicio,
        });
        await this.amostraRepository.save(amostra);
      }
    }
    console.log('20 pacientes e suas respectivas amostras foram criados.');
  }
}
