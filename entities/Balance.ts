import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('balance')
export class Balance {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ unique: true, type: 'integer', nullable: false })
	userId!: number;

	@Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
	balance!: number;
}
