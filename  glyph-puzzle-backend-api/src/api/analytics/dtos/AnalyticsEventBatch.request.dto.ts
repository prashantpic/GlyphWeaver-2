import { IsArray, ValidateNested, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { AnalyticsEventDTO } from './AnalyticsEvent.dto';

export class AnalyticsEventBatchRequestDTO {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AnalyticsEventDTO)
  events!: AnalyticsEventDTO[];
}