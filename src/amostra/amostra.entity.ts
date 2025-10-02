import { Medico } from '../medico/medico.entity';
import { Paciente } from '../paciente/paciente.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tb_amostras')
export class Amostra {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome_amostra: string;

  @Column()
  comprimento: string;

  @Column()
  largura: string;

  @Column()
  altura: string;

  @Column()
  possivel_diagnostico: string;

  @Column()
  observacao: string;

  @Column({
    type: 'int',
    default: 0,
  })
  numeroExame: number;

  @Column({ type: 'timestamp', nullable: true })
  inicio_analise: Date;

  @Column({ type: 'timestamp', nullable: true })
  fim_analise: Date;

  @Column({ type: 'float', nullable: true })
  tempo_total_analise: number;

  @CreateDateColumn()
  dataRegistro: Date;

  @UpdateDateColumn()
  dataAtualizacao: Date;

  @Column({ type: 'jsonb', default: [] })
  imageUrls: string[];

  @ManyToOne(() => Paciente, (paciente) => paciente.amostras, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_paciente' })
  paciente: Paciente;

  @ManyToOne(() => Medico, (medico) => medico.amostras)
  @JoinColumn({ name: 'id_medico' })
  medico: Medico;
}
