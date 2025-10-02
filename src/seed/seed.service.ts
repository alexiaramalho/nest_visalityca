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
  ) {}

  async run() {
    console.log('Iniciando o processo de seeding...');
    await this.cleanDatabase();
    await this.populateDatabase();
    console.log('Seeding concluído com sucesso!');
  }

  private async cleanDatabase() {
    console.log('Limpando tabelas com CASCADE...');
    await this.amostraRepository.query(
      'TRUNCATE TABLE "tb_amostras", "tb_pacientes", "tb_medicos" RESTART IDENTITY CASCADE;',
    );

    console.log('Tabelas limpas.');
  }

  private async populateDatabase() {
    console.log('Povoando o banco de dados com novos dados...'); // Criar 5 Médicos

    const medicos: Medico[] = [];
    for (let i = 0; i < 5; i++) {
      const nomeCompleto = faker.person.fullName();
      const medicoData = {
        nome: nomeCompleto,
        username: faker.internet.username({
          firstName: nomeCompleto.split(' ')[0],
        }),
        crm: faker.string.numeric(7),
        cpf: faker.string.numeric(11),
        senha: 'password123',
        dataNascimento: faker.date.birthdate(),
      };
      const medico = this.medicoRepository.create(medicoData);
      const savedMedico = await this.medicoRepository.save(medico);
      medicos.push(savedMedico);
    }
    console.log(`${medicos.length} médicos criados.`); // Criar 20 Pacientes

    const dataInicioRange = new Date('2025-08-01T00:00:00.000Z');
    const dataFimRange = new Date();

    for (let i = 0; i < 20; i++) {
      // 1. Cria e salva UM paciente
      const pacienteData = {
        nome: faker.person.fullName(),
        cpf: faker.string.numeric(11),
        dataNascimento: faker.date.birthdate(),
      };
      const paciente = this.pacienteRepository.create(pacienteData);
      const savedPaciente = await this.pacienteRepository.save(paciente);

      // 2. Define aleatoriamente quantos exames (amostras) este paciente terá (entre 1 e 3)
      const numeroDeAmostrasParaEstePaciente = faker.number.int({
        min: 1,
        max: 5,
      });

      console.log(
        `Criando ${numeroDeAmostrasParaEstePaciente} amostra(s) para o paciente ${savedPaciente.nome}...`,
      );

      // 3. Loop INTERNO para criar as amostras PARA ESTE PACIENTE ESPECÍFICO
      for (let j = 0; j < numeroDeAmostrasParaEstePaciente; j++) {
        const inicio = faker.date.between({
          from: dataInicioRange,
          to: dataFimRange,
        });
        const duracaoEmMs = faker.number.int({ min: 60000, max: 300000 });
        const fim = new Date(inicio.getTime() + duracaoEmMs);
        const tempoTotalMin = parseFloat(
          ((fim.getTime() - inicio.getTime()) / 60000).toFixed(2),
        );

        const amostra = this.amostraRepository.create({
          // O número do exame agora é o contador deste loop interno (j) + 1
          numeroExame: j + 1,
          nome_amostra: `Amostra #${j + 1} de ${savedPaciente.nome.split(' ')[0]}`,
          comprimento: `${faker.number.float({ min: 1, max: 10 }).toFixed(2)}`,
          largura: `${faker.number.float({ min: 1, max: 10 }).toFixed(2)}`,
          altura: `${faker.number.float({ min: 1, max: 10 }).toFixed(2)}`,
          possivel_diagnostico: faker.lorem.sentence(),
          observacao: faker.lorem.paragraph(),
          inicio_analise: inicio,
          fim_analise: fim,
          tempo_total_analise: tempoTotalMin,
          // A amostra pertence ao paciente que acabamos de criar
          paciente: savedPaciente,
          // O médico ainda pode ser aleatório
          medico: faker.helpers.arrayElement(medicos),
          dataRegistro: inicio,
          dataAtualizacao: inicio,
        });
        await this.amostraRepository.save(amostra);
      }
    }
    console.log('20 pacientes e suas respectivas amostras foram criados.');
  }
}
