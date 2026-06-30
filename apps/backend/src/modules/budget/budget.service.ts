import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BudgetService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getBudget() {
    const rows = await this.dataSource.query('SELECT * FROM budget ORDER BY budget_id');
    return rows;
  }

  async getSummary() {
    const rows = await this.dataSource.query('SELECT * FROM v_budget_summary ORDER BY budget_id');
    return rows;
  }

  async createBudget(name: string, amount: number) {
    const query = `
      INSERT INTO budget (budget_name, budget_amount, budget_counter)
      VALUES ($1, $2, 1)
      RETURNING *
    `;
    const result = await this.dataSource.query(query, [name, amount]);
    return result[0];
  }

  async updateBudget(id: number, name: string, amount: number) {
    const query = `
      UPDATE budget
      SET budget_name = $1, budget_amount = $2, updated_at = CURRENT_TIMESTAMP
      WHERE budget_id = $3
      RETURNING *
    `;
    const result = await this.dataSource.query(query, [name, amount, id]);
    return result[0];
  }
}
