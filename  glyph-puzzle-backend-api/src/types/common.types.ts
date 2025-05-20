export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface ServiceResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string; // e.g., 'VALIDATION_ERROR', 'NOT_FOUND'
    details?: any;
  };
}

export interface ErrorDetails {
  field?: string;
  message: string;
}

export type Platform = 'apple' | 'google';

export type TimeScope = 'daily' | 'weekly' | 'all';