// src/common/dtos/PagedResult.dto.ts

export class PagedResultDto<T> {
  public readonly items: T[];
  public readonly totalCount: number;
  public readonly page: number;
  public readonly pageSize: number;
  public readonly totalPages: number;

  constructor(items: T[], totalCount: number, page: number, pageSize: number) {
    this.items = items;
    this.totalCount = totalCount;
    this.page = page;
    this.pageSize = pageSize;
    this.totalPages = Math.ceil(totalCount / pageSize);
  }
}