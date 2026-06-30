import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('login_attempts')
export class LoginAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  username: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address: string;

  @Column({ type: 'boolean' })
  is_successful: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  failure_reason: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  attempted_at: Date;
}
