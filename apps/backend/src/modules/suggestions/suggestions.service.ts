import { Injectable } from '@nestjs/common';

export interface Suggestion {
  id: string;
  userId: string;
  title: string;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

@Injectable()
export class SuggestionsService {
  private suggestions: Suggestion[] = [];

  async create(userId: string, data: { title: string; content: string }): Promise<Suggestion> {
    const newSuggestion: Suggestion = {
      id: Math.random().toString(36).substring(2, 11),
      userId,
      title: data.title,
      content: data.content,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    this.suggestions.push(newSuggestion);
    return newSuggestion;
  }

  async findAll(): Promise<Suggestion[]> {
    return this.suggestions;
  }

  async findByUser(userId: string): Promise<Suggestion[]> {
    return this.suggestions.filter(s => s.userId === userId);
  }

  async updateStatus(id: string, status: 'APPROVED' | 'REJECTED'): Promise<Suggestion> {
    const suggestion = this.suggestions.find(s => s.id === id);
    if (suggestion) {
      suggestion.status = status;
      return suggestion;
    }
    throw new Error('Suggestion not found.');
  }
}
