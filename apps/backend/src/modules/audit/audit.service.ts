import { Injectable, Logger } from '@nestjs/common';

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: string;
  ipAddress: string;
  details: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private logs: AuditLog[] = [];

  async logAction(logData: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    const newLog: AuditLog = {
      id: Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toISOString(),
      ...logData,
    };
    this.logs.push(newLog);
    this.logger.log(`[AUDIT] Action: ${newLog.action} | Resource: ${newLog.resource} | User: ${newLog.userId}`);
    return newLog;
  }

  async getLogs(userId?: string): Promise<AuditLog[]> {
    if (userId) {
      return this.logs.filter(log => log.userId === userId);
    }
    return this.logs;
  }
}
