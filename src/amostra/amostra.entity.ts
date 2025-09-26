import { Medico } from '../medico/medico.entity';
import { Paciente } from '../paciente/paciente.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
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

  @Column()
  imagens: string;

  @ManyToOne(() => Paciente, (paciente) => paciente.amostras)
  @JoinColumn({ name: 'id_paciente' })
  paciente: Paciente;

  @ManyToOne(() => Medico, (medico) => medico.amostras)
  @JoinColumn({ name: 'id_medico' })
  medico: Medico;
}
