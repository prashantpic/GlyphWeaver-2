import { PlayerDataDTO } from './PlayerData.dto';

export class SyncResponseDTO {
  success!: boolean;
  latestData!: PlayerDataDTO;
  conflict!: boolean;
  message?: string;
}