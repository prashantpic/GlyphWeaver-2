import * as bcrypt from 'bcrypt';
import { AppConfig } from '../config/app.config'; // Assuming salt rounds are in AppConfig

export class HashingService {
  private readonly saltRounds: number;

  constructor(appConfig: AppConfig) {
    this.saltRounds = appConfig.bcryptSaltRounds;
  }

  async hash(data: string): Promise<string> {
    return bcrypt.hash(data, this.saltRounds);
  }

  async compare(data: string, encrypted: string): Promise<boolean> {
    return bcrypt.compare(data, encrypted);
  }
}