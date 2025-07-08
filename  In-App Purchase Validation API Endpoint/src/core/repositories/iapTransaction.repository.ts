import { IapTransactionModel, IIapTransaction } from '../domain/iapTransaction.model';

/**
 * @class IapTransactionRepository
 * @description Encapsulates all database logic for IAPTransaction documents,
 * decoupling the application's business logic from the data access layer.
 */
export class IapTransactionRepository {
  /**
   * Finds a single IAP transaction record by its platform and platform-specific transaction ID.
   * This is primarily used to detect and prevent replay attacks.
   * @param {string} platform - The platform ('ios' or 'android').
   * @param {string} transactionId - The unique transaction identifier from the platform.
   * @returns {Promise<IIapTransaction | null>} The found transaction document or null if not found.
   */
  public async findByPlatformTransactionId(platform: string, transactionId: string): Promise<IIapTransaction | null> {
    return IapTransactionModel.findOne({ platform, platformTransactionId }).exec();
  }

  /**
   * Creates a new IAP transaction record in the database.
   * It is typically created with a 'pending' status before validation is complete.
   * @param {Partial<IIapTransaction>} transactionData - The data for the new transaction.
   * @returns {Promise<IIapTransaction>} The newly created transaction document.
   */
  public async create(transactionData: Partial<IIapTransaction>): Promise<IIapTransaction> {
    const newTransaction = new IapTransactionModel(transactionData);
    return newTransaction.save();
  }

  /**
   * Updates an existing IAP transaction record by its document ID.
   * This is used to update the status and store validation results after processing.
   * @param {string} id - The MongoDB document ID of the transaction to update.
   * @param {Partial<IIapTransaction>} updates - An object containing the fields to update.
   * @returns {Promise<IIapTransaction | null>} The updated transaction document or null if not found.
   */
  public async update(id: string, updates: Partial<IIapTransaction>): Promise<IIapTransaction | null> {
    return IapTransactionModel.findByIdAndUpdate(id, updates, { new: true }).exec();
  }
}