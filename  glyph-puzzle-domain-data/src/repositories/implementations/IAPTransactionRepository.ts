import mongoose, { FilterQuery } from 'mongoose';
import { IAPTransactionDocument, IAPTransactionModel } from '../../domain/iap/IAPTransaction.schema';
import { IIAPTransactionRepository } from '../interfaces/IIAPTransactionRepository';
import { BaseRepository } from './BaseRepository';

export class IAPTransactionRepository
  extends BaseRepository<IAPTransactionDocument, typeof IAPTransactionModel>
  implements IIAPTransactionRepository
{
  constructor() {
    super(IAPTransactionModel);
  }

  async findByTransactionId(transactionId: string): Promise<IAPTransactionDocument | null> {
    return this.model.findOne({ transactionId }).exec();
  }

  async findPendingTransactions(limit: number = 50): Promise<IAPTransactionDocument[]> {
    return this.model
      .find({ processed: false, validationStatus: 'pending' })
      .limit(limit)
      .sort({ purchaseDate: 1 }) // Process older ones first
      .exec();
  }
}