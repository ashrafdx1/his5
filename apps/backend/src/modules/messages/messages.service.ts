import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class MessagesService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async createRequest(employeeId: number): Promise<any> {
    // Check if there is an active thread
    const active = await this.dataSource.query(
      `SELECT * FROM message_request WHERE employee_id = $1 AND status IN ('PENDING', 'ACCEPTED') LIMIT 1`,
      [employeeId]
    );

    if (active && active.length > 0) {
      return active[0];
    }

    // Otherwise create a new request
    const insertRes = await this.dataSource.query(
      `INSERT INTO message_request (employee_id, status, messages, has_admin_unread, has_employee_unread) 
       VALUES ($1, 'PENDING', '[]', true, false) RETURNING *`,
      [employeeId]
    );

    return insertRes[0];
  }

  async getEmployeeActiveThread(employeeId: number): Promise<any> {
    const res = await this.dataSource.query(
      `SELECT * FROM message_request WHERE employee_id = $1 ORDER BY updated_at DESC LIMIT 1`,
      [employeeId]
    );
    if (res && res.length > 0) {
      return res[0];
    }
    return null;
  }

  async employeeSendMessage(threadId: number, text: string): Promise<any> {
    const threadRes = await this.dataSource.query(
      `SELECT messages, status FROM message_request WHERE id = $1`,
      [threadId]
    );

    if (!threadRes || threadRes.length === 0) {
      throw new NotFoundException('Message thread not found.');
    }

    const currentMessages = JSON.parse(threadRes[0].messages || '[]');
    currentMessages.push({
      sender: 'employee',
      text,
      timestamp: new Date().toISOString(),
    });

    const updateRes = await this.dataSource.query(
      `UPDATE message_request 
       SET messages = $1, has_admin_unread = true, has_employee_unread = false, updated_at = NOW() 
       WHERE id = $2 RETURNING *`,
      [JSON.stringify(currentMessages), threadId]
    );

    return updateRes[0];
  }

  async getAdminThreads(): Promise<any[]> {
    return this.dataSource.query(
      `SELECT mr.*, 
              e.english_first_name, e.english_last_name, e.email, e.employment_type, e.employee_picture_url,
              d.department_name 
       FROM message_request mr 
       JOIN employee e ON mr.employee_id = e.employee_id 
       LEFT JOIN department d ON e.department_id = d.department_id 
       ORDER BY mr.updated_at DESC`
    );
  }

  async adminRespondRequest(threadId: number, action: 'ACCEPT' | 'DENY'): Promise<any> {
    const threadRes = await this.dataSource.query(
      `SELECT messages FROM message_request WHERE id = $1`,
      [threadId]
    );

    if (!threadRes || threadRes.length === 0) {
      throw new NotFoundException('Message thread not found.');
    }

    const status = action === 'ACCEPT' ? 'ACCEPTED' : 'DENIED';
    const currentMessages = JSON.parse(threadRes[0].messages || '[]');
    
    if (action === 'ACCEPT') {
      currentMessages.push({
        sender: 'admin',
        text: 'Hello! I have accepted your message request. How can I help you?',
        timestamp: new Date().toISOString(),
        isSystem: true
      });
    } else {
      currentMessages.push({
        sender: 'admin',
        text: 'Your request to message the admin has been denied.',
        timestamp: new Date().toISOString(),
        isSystem: true
      });
    }

    const updateRes = await this.dataSource.query(
      `UPDATE message_request 
       SET status = $1, messages = $2, has_admin_unread = false, has_employee_unread = true, updated_at = NOW() 
       WHERE id = $3 RETURNING *`,
      [status, JSON.stringify(currentMessages), threadId]
    );

    return updateRes[0];
  }

  async adminSendMessage(threadId: number, text: string): Promise<any> {
    const threadRes = await this.dataSource.query(
      `SELECT messages FROM message_request WHERE id = $1`,
      [threadId]
    );

    if (!threadRes || threadRes.length === 0) {
      throw new NotFoundException('Message thread not found.');
    }

    const currentMessages = JSON.parse(threadRes[0].messages || '[]');
    currentMessages.push({
      sender: 'admin',
      text,
      timestamp: new Date().toISOString(),
    });

    const updateRes = await this.dataSource.query(
      `UPDATE message_request 
       SET messages = $1, has_admin_unread = false, has_employee_unread = true, updated_at = NOW() 
       WHERE id = $2 RETURNING *`,
      [JSON.stringify(currentMessages), threadId]
    );

    return updateRes[0];
  }

  async adminCloseThread(threadId: number): Promise<any> {
    const threadRes = await this.dataSource.query(
      `SELECT messages FROM message_request WHERE id = $1`,
      [threadId]
    );

    if (!threadRes || threadRes.length === 0) {
      throw new NotFoundException('Message thread not found.');
    }

    const currentMessages = JSON.parse(threadRes[0].messages || '[]');
    currentMessages.push({
      sender: 'admin',
      text: 'This chat thread has been closed by the admin.',
      timestamp: new Date().toISOString(),
      isSystem: true
    });

    const updateRes = await this.dataSource.query(
      `UPDATE message_request 
       SET status = 'CLOSED', messages = $1, has_admin_unread = false, has_employee_unread = true, updated_at = NOW() 
       WHERE id = $2 RETURNING *`,
      [JSON.stringify(currentMessages), threadId]
    );

    return updateRes[0];
  }

  async adminGetUnreadCount(): Promise<number> {
    const res = await this.dataSource.query(
      `SELECT COUNT(*)::integer as count FROM message_request WHERE has_admin_unread = true`
    );
    return res[0]?.count || 0;
  }

  async employeeMarkRead(threadId: number): Promise<void> {
    await this.dataSource.query(
      `UPDATE message_request SET has_employee_unread = false WHERE id = $1`,
      [threadId]
    );
  }

  async adminMarkRead(threadId: number): Promise<void> {
    await this.dataSource.query(
      `UPDATE message_request SET has_admin_unread = false WHERE id = $1`,
      [threadId]
    );
  }
}
