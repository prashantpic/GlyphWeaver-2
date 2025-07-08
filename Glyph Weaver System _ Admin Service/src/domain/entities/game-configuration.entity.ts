import { randomUUID } from 'crypto';

/**
 * @file This file contains the core GameConfiguration entity, which is the aggregate root for all configuration-related operations. It manages its own state and business rules.
 * @namespace GlyphWeaver.Backend.System.Domain.Entities
 */

/**
 * @interface GameConfigurationProps
 * @description Properties required to create a GameConfiguration entity.
 */
export interface GameConfigurationProps {
  _id?: string;
  key: string;
  value: any;
  version?: number;
  description: string;
  updatedAt?: Date;
  lastUpdatedBy: string;
}

/**
 * @class GameConfiguration
 * @description Represents a single, versioned game configuration setting. It is the aggregate root for all configuration operations.
 * @implements DDD-Aggregate, DDD-Entity
 */
export class GameConfiguration {
  public readonly _id: string;
  public readonly key: string;
  private value: any;
  public version: number;
  public description: string;
  public updatedAt: Date;
  public lastUpdatedBy: string;

  /**
   * Initializes a new GameConfiguration instance.
   * @param {GameConfigurationProps} props - The properties of the game configuration.
   */
  constructor(props: GameConfigurationProps) {
    this._id = props._id ?? randomUUID();
    this.key = props.key;
    this.value = props.value;
    this.version = props.version ?? 1;
    this.description = props.description;
    this.updatedAt = props.updatedAt ?? new Date();
    this.lastUpdatedBy = props.lastUpdatedBy;
  }

  /**
   * Updates the value of the configuration.
   * This method encapsulates the business logic for an update:
   * - Sets the new value.
   * - Increments the version number for optimistic concurrency control.
   * - Updates the modification timestamp.
   * - Records who made the update.
   * @param {any} newValue - The new value for the configuration.
   * @param {string} updatedBy - Identifier of the administrator or system performing the update.
   */
  public updateValue(newValue: any, updatedBy: string): void {
    this.value = newValue;
    this.version += 1;
    this.updatedAt = new Date();
    this.lastUpdatedBy = updatedBy;
  }

  /**
   * Returns the current value of the configuration.
   * @returns {any} The current value.
   */
  public getValue(): any {
    return this.value;
  }
}