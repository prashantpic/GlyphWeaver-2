import { randomUUID } from 'crypto';

/**
 * The possible states of an IAP transaction.
 */
export type IAPTransactionStatus = 'pending' | 'validated' | 'failed' | 'fulfilled' | 'error';

/**
 * Properties required to create a new IAPTransaction.
 */
export interface IAPTransactionProps {
    id?: string;
    userId: string;
    sku: string;
    platform: 'ios' | 'android';
    platformTransactionId: string;
    purchaseDate: Date;
    status?: IAPTransactionStatus;
    validationResponse?: any;
    fulfillmentDetails?: any;
}

/**
 * @class IAPTransaction
 * @description Represents the IAPTransaction aggregate root. It is the core domain model
 * for a single purchase transaction, encapsulating its state, properties, and business rules.
 * This class ensures the integrity of a transaction through controlled state transitions.
 */
export class IAPTransaction {
    public readonly id: string;
    public readonly userId: string;
    public readonly sku: string;
    public readonly platform: 'ios' | 'android';
    public readonly platformTransactionId: string;
    public readonly purchaseDate: Date;

    private _status: IAPTransactionStatus;
    private _validationResponse: any;
    private _fulfillmentDetails: any;

    private constructor(props: IAPTransactionProps) {
        this.id = props.id || randomUUID();
        this.userId = props.userId;
        this.sku = props.sku;
        this.platform = props.platform;
        this.platformTransactionId = props.platformTransactionId;
        this.purchaseDate = props.purchaseDate;
        this._status = props.status || 'pending';
        this._validationResponse = props.validationResponse;
        this._fulfillmentDetails = props.fulfillmentDetails;
    }

    /**
     * Static factory method to create a new IAPTransaction instance.
     * Ensures all new transactions start in a valid 'pending' state.
     * @param props - The initial properties of the transaction.
     * @returns A new instance of IAPTransaction.
     */
    public static create(props: Omit<IAPTransactionProps, 'id' | 'status'>): IAPTransaction {
        return new IAPTransaction({ ...props, status: 'pending' });
    }

    /**
     * Reconstitutes an existing transaction aggregate from persistence.
     * @param props The full properties of an existing transaction.
     * @returns An instance of IAPTransaction.
     */
    public static reconstitute(props: IAPTransactionProps): IAPTransaction {
        if (!props.id) {
            throw new Error('Cannot reconstitute transaction without an ID.');
        }
        return new IAPTransaction(props);
    }

    /**
     * Marks the transaction as validated.
     * This transition is only valid from a 'pending' state.
     * @param validationResponse - The raw response from the validation service.
     */
    public markAsValidated(validationResponse: any): void {
        if (this._status !== 'pending') {
            throw new Error(`Transaction in status '${this._status}' cannot be marked as validated.`);
        }
        this._status = 'validated';
        this._validationResponse = validationResponse;
    }

    /**
     * Marks the transaction as fulfilled.
     * This transition is only valid from a 'validated' state.
     * @param fulfillmentDetails - The details of the fulfillment action.
     */
    public markAsFulfilled(fulfillmentDetails: any): void {
        if (this._status !== 'validated') {
            throw new Error(`Transaction in status '${this._status}' cannot be marked as fulfilled.`);
        }
        this._status = 'fulfilled';
        this._fulfillmentDetails = fulfillmentDetails;
    }

    /**
     * Marks the transaction as failed, typically due to an invalid receipt.
     * @param failureReason - The reason for the failure.
     */
    public markAsFailed(failureReason: any): void {
        if (this._status === 'fulfilled' || this._status === 'validated') {
             throw new Error(`Transaction in status '${this._status}' cannot be marked as failed.`);
        }
        this._status = 'failed';
        this._validationResponse = failureReason;
    }

    /**
     * Marks the transaction as having a fulfillment error.
     * This state indicates a problem after successful validation that requires attention.
     * @param errorDetails - Details about the fulfillment error.
     */
    public markAsError(errorDetails: any): void {
        if (this._status !== 'validated') {
            throw new Error(`Transaction in status '${this._status}' cannot be marked as error.`);
        }
        this._status = 'error';
        this._fulfillmentDetails = errorDetails;
    }

    /**
     * Checks if the transaction has already been successfully processed.
     * @returns `true` if the status is 'validated', 'fulfilled', or 'error'.
     */
    public isAlreadyProcessed(): boolean {
        return ['validated', 'fulfilled', 'error'].includes(this._status);
    }
    
    /**
     * Returns a plain object representation of the aggregate's current state.
     */
    public getProps(): IAPTransactionProps {
        return {
            id: this.id,
            userId: this.userId,
            sku: this.sku,
            platform: this.platform,
            platformTransactionId: this.platformTransactionId,
            purchaseDate: this.purchaseDate,
            status: this._status,
            validationResponse: this._validationResponse,
            fulfillmentDetails: this._fulfillmentDetails,
        };
    }
}