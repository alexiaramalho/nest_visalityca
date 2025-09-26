import { Amostra } from '../amostra/amostra.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('tb_pacientes')
export class Paciente {
  @PrimaryGeneratedColumn({ name: 'id_paciente' })
  id: number;

  @Column({ type: 'varchar', length: 150, nullable: false })
  nome: string;

  @Column({ type: 'varchar', length: 11, nullable: false, unique: true })
  cpf: string;

  @Column({ type: 'date', name: 'data_nascimento', nullable: false })
  dataNascimento: Date;

  @OneToMany(() => Amostra, (amostra) => amostra.paciente)
  amostras: Amostra[];
}
