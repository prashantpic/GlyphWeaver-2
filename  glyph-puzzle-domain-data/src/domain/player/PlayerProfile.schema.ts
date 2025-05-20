import mongoose, { Document, Model, Schema } from 'mongoose';
import { defaultSchemaOptions } from '../_common/SchemaOptions';
import { PlayerLevelProgressSchema, IPlayerLevelProgress } from './PlayerLevelProgress.schema';
import { PlayerConsumableSchema, IPlayerConsumable } from './PlayerConsumable.schema';
import { PlayerVirtualCurrencySchema, IPlayerVirtualCurrency } from './PlayerVirtualCurrency.schema';

// Interface for the PlayerProfile document
export interface IPlayerProfile extends Document {
  userId: string;
  platformUserId?: string;
  displayName: string;
  email?: string;
  levelProgress: IPlayerLevelProgress[];
  iapInventory: IPlayerConsumable[];
  virtualCurrencies: IPlayerVirtualCurrency[];
  preferences?: mongoose.Schema.Types.Mixed;
  createdAt: Date;
  updatedAt: Date;
  schemaVersion: number;
}

// Interface for the PlayerProfile model
export interface IPlayerProfileModel extends Model<IPlayerProfile> {}

const PlayerProfileSchema = new Schema<IPlayerProfile, IPlayerProfileModel>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    platformUserId: { type: String, sparse: true, index: true },
    displayName: { type: String, required: true },
    email: { type: String, sparse: true, unique: true },
    levelProgress: [PlayerLevelProgressSchema],
    iapInventory: [PlayerConsumableSchema],
    virtualCurrencies: [PlayerVirtualCurrencySchema],
    preferences: { type: mongoose.Schema.Types.Mixed },
  },
  defaultSchemaOptions
);

export const PlayerProfileModel = mongoose.model<IPlayerProfile, IPlayerProfileModel>('PlayerProfile', PlayerProfileSchema);
export type PlayerProfileDocument = IPlayerProfile;