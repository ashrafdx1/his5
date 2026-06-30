import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Role } from '../../rbac/entities/role.entity';

@Entity('admin')
export class Admin {
  @PrimaryGeneratedColumn({ name: 'admin_id' })
  admin_id: number;

  @Column({ unique: true, type: 'varchar', length: 50 })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0.00 })
  salary: number;

  @Column({ name: 'profile_picture_url', type: 'varchar', length: 2048, nullable: true })
  profile_picture_url: string;

  @Column({ type: 'integer', default: 0 })
  login_count: number;

  @Column({ type: 'integer', default: 0 })
  password_change_count: number;

  @Column({ type: 'integer', default: 0 })
  failed_login_attempts: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  locked_until: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  last_login_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  last_password_change_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  last_username_change_at: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @ManyToMany(() => Role, (role) => role.admins, { cascade: true })
  @JoinTable({
    name: 'admin_roles',
    joinColumn: { name: 'admin_id', referencedColumnName: 'admin_id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];
}
