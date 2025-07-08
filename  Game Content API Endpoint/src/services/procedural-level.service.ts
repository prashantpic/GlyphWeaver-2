import { RegisterLevelDto } from '../api/v1/procedural-levels/dto/register-level.dto';
import { ProceduralLevelRepository } from '../data/repositories/procedural-level.repository';
import { IAuditService } from '../interfaces/audit.interface';
import { IProceduralLevel } from '../data/models/procedural-level.model';
import mongoose from 'mongoose';

/**
 * Application service that handles the business logic for managing procedurally generated levels.
 * It orchestrates interactions between the presentation layer (controllers) and the
 * data access layer (repositories), enforcing business rules.
 */
export class ProceduralLevelService {
  /**
   * @param proceduralLevelRepository The repository for procedural level data access.
   * @param auditService The service for logging important system events.
   */
  constructor(
    private readonly proceduralLevelRepository: ProceduralLevelRepository,
    private readonly auditService: IAuditService
  ) {}

  /**
   * Registers a new procedural level instance.
   * It takes the validated level data and player ID, persists it to the database,
   * logs the event, and returns the unique ID of the new level instance.
   *
   * @param levelData The DTO containing data for the new level.
   * @param playerId The ID of the player who generated this level.
   * @returns A promise that resolves to the unique ID (string) of the created level.
   */
  public async registerLevel(levelData: RegisterLevelDto, playerId: string): Promise<string> {
    const dataToSave: Partial<IProceduralLevel> = {
      ...levelData,
      playerId: new mongoose.Types.ObjectId(playerId),
    };

    const createdLevel = await this.proceduralLevelRepository.create(dataToSave);

    await this.auditService.logEvent('LEVEL_INSTANCE_REGISTERED', {
      playerId,
      proceduralLevelId: createdLevel._id.toString(),
      baseLevelId: createdLevel.baseLevelId,
    });

    return createdLevel._id.toString();
  }
}