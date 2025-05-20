import { IsString, IsNotEmpty, IsISO8601, IsOptional, IsObject } from 'class-validator';

export class AnalyticsEventDTO {
  @IsString()
  @IsNotEmpty()
  eventName!: string;

  @IsISO8601()
  timestamp!: string; // ISO 8601 date string

  @IsOptional()
  @IsObject()
  parameters?: any;
}