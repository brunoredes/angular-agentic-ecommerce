import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ColumnDef, QueryResult, TABLE_NAMES, TableName } from '../models/data-query';
import { apiErrorMessage } from './api-error';

type TableInfo = { name: TableName; description: string; rowCount: number };
type TableSchema = { name: TableName; description: string; columns: ColumnDef[] };
type Relationship = { from: string; to: string; kind: string };

/** Read-only virtual tables over the catalog and cart. Validation and execution live in the backend (POST /api/query). */
@Service()
export class DataTablesService {
  private readonly http = inject(HttpClient);

  listTables(): Promise<TableInfo[]> {
    return firstValueFrom(this.http.get<TableInfo[]>('/api/tables'));
  }

  async describe(name: unknown): Promise<TableSchema | undefined> {
    if (!TABLE_NAMES.includes(name as TableName)) return undefined;
    return firstValueFrom(this.http.get<TableSchema>(`/api/tables/${name as TableName}`));
  }

  relationships(): Promise<Relationship[]> {
    return firstValueFrom(this.http.get<Relationship[]>('/api/tables/relationships'));
  }

  /** Runs an untrusted query object (from an agent); the server validates it and answers { error } when invalid. */
  async query(input: unknown): Promise<QueryResult> {
    try {
      return await firstValueFrom(this.http.post<QueryResult>('/api/query', input));
    } catch (e) {
      return { error: apiErrorMessage(e) };
    }
  }
}
