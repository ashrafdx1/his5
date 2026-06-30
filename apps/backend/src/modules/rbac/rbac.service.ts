import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async getRoles(): Promise<string[]> {
    const roles = await this.roleRepository.find();
    return roles.map(r => r.name);
  }

  async getPermissionsForRole(roleName: string): Promise<string[]> {
    const role = await this.roleRepository.findOne({
      where: { name: roleName.toUpperCase() },
      relations: ['permissions'],
    });
    if (!role) {
      throw new NotFoundException(`Role '${roleName}' not found.`);
    }
    return role.permissions.map(p => p.code);
  }

  async checkPermission(roleName: string, permissionCode: string): Promise<boolean> {
    const role = await this.roleRepository.findOne({
      where: { name: roleName.toUpperCase() },
      relations: ['permissions'],
    });
    if (!role) return false;
    
    return role.permissions.some(
      p => p.code === '*' || p.code === permissionCode
    );
  }
}
