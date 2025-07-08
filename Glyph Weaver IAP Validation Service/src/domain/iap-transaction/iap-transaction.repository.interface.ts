import { IAPTransaction } from './iap-transaction.aggregate';

/**
 * @interface IIAPTransactionRepository
 * @description Defines the contract for data persistence of the IAPTransaction aggregate.
 * This interface is a port in the domain layer, decoupling the application's core logic
 * from specific database technologies (e.g., MongoDB, PostgreSQL).
 */
export interface IIAPTransactionRepository {
    /**
     * Finds a transaction by its unique internal ID.
     * @param id - The unique identifier of the transaction aggregate.
     * @returns A Promise that resolves to the IAPTransaction aggregate or null if not found.
     */
    findById(id: string): Promise<IAPTransaction | null>;

    /**
     * Finds a transaction by its platform-specific transaction ID.
     * This is crucial for preventing replay attacks and duplicate processing.
     * @param platform - The platform ('ios' or 'android').
     * @param transactionId - The unique transaction identifier from the App Store or Play Store.
     * @returns A Promise that resolves to the IAPTransaction aggregate or null if not found.
     */
    findByPlatformTransactionId(
        platform: 'ios' | 'android',
        transactionId: string
    ): Promise<IAPTransaction | null>;

    /**
     * Persists a new IAPTransaction aggregate.
     * @param transaction - The IAPTransaction aggregate instance to create.
     * @returns A Promise that resolves when the operation is complete.
     */
    create(transaction: IAPTransaction): Promise<void>;

    /**
     * Persists changes to an existing IAPTransaction aggregate.
     * This method is used to update the state of a transaction (e.g., status changes).
     * @param transaction - The IAPTransaction aggregate instance to save.
     * @returns A Promise that resolves when the operation is complete.
     */
    save(transaction: IAPTransaction): Promise<void>;
}