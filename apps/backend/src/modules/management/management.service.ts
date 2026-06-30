import { Injectable } from '@nestjs/common';

export interface HospitalConfig {
  name: string;
  address: string;
  phone: string;
  emergencyContact: string;
  allowedDomains: string[];
}

@Injectable()
export class ManagementService {
  private config: HospitalConfig = {
    name: 'General Hospital Information System (HIS)',
    address: '100 Medical Plaza, Healthcare City',
    phone: '+1 (555) 123-4567',
    emergencyContact: '+1 (555) 999-9999',
    allowedDomains: ['his-hospital.com'],
  };

  async getConfig(): Promise<HospitalConfig> {
    return this.config;
  }

  async updateConfig(newConfig: Partial<HospitalConfig>): Promise<HospitalConfig> {
    this.config = { ...this.config, ...newConfig };
    return this.config;
  }
}
