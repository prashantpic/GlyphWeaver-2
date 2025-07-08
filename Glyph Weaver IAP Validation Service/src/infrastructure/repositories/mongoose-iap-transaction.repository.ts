import { Model } from 'mongoose';
import { IIAPTransactionRepository } from '../../domain/iap-transaction/iap-transaction.repository.interface';
import { IAPTransaction, IAPTransactionProps } from '../../domain/iap-transaction/iap-transaction.aggregate';
import { IAPTransactionDocument } from '../mongodb/schemas/iap-transaction.schema';

/**
 * @class MongooseIAPTransactionRepository
 * @description Implements the IIAPTransactionRepository interface using Mongoose for MongoDB.
 * It handles all database operations for IAPTransaction aggregates, including the mapping
 * between the domain model and the persistence model (Mongoose document).
 */
export class MongooseIAPTransactionRepository implements IIAPTransactionRepository {
    /**
     * @param iapTransactionModel - The injected Mongoose model for IAPTransaction documents.
     */
    constructor(
        private readonly iapTransactionModel: Model<IAPTransactionDocument>
    ) {}

    /**
     * Converts a Mongoose document to a domain aggregate.
     * @param doc The Mongoose document.
     * @returns An IAPTransaction aggregate instance.
     */
    private toDomain(doc: IAPTransactionDocument): IAPTransaction {
        const props: IAPTransactionProps = {
            id: doc._id,
            userId: doc.userId,
            sku: doc.sku,
            platform: doc.platform,
            platformTransactionId: doc.platformTransactionId,
            purchaseDate: doc.purchaseDate,
            status: doc.status,
            validationResponse: doc.validationResponse,
            fulfillmentDetails: doc.fulfillmentDetails,
        };
        return IAPTransaction.reconstitute(props);
    }

    /**
     * Converts a domain aggregate to a plain object for persistence.
     * @param transaction The IAPTransaction aggregate.
     * @returns A plain JavaScript object.
     */
    private toPersistence(transaction: IAPTransaction): IAPTransactionProps {
        const props = transaction.getProps();
        return { ...props, _id: props.id }; // Mongoose uses _id
    }

    async findById(id: string): Promise<IAPTransaction | null> {
        const doc = await this.iapTransactionModel.findById(id).exec();
        return doc ? this.toDomain(doc) : null;
    }

    async findByPlatformTransactionId(platform: 'ios' | 'android', transactionId: string): Promise<IAPTransaction | null> {
        const doc = await this.iapTransactionModel.findOne({
            platform,
            platformTransactionId: transactionId,
        }).exec();
        return doc ? this.toDomain(doc) : null;
    }

    async create(transaction: IAPTransaction): Promise<void> {
        const persistenceData = this.toPersistence(transaction);
        // Mongoose's create method wants the `_id` property on the object
        const dataToSave = { ...persistenceData, _id: transaction.id };
        await this.iapTransactionModel.create(dataToSave);
    }

    async save(transaction: IAPTransaction): Promise<void> {
        const persistenceData = this.toPersistence(transaction);
        await this.iapTransactionModel.findByIdAndUpdate(transaction.id, persistenceData).exec();
    }
}