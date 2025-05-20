import { IBaseRepository } from './IBaseRepository';
import { IAPTransactionDocument, IAPTransactionModel } from '../../domain/iap/IAPTransaction.schema';

export interface IIAPTransactionRepository extends IBaseRepository<IAPTransactionDocument, IAPTransactionModel> {
  findByTransactionId(transactionId: string): Promise<IAPTransactionDocument | null>;
  findPendingTransactions(limit: number): Promise<IAPTransactionDocument[]>;
}