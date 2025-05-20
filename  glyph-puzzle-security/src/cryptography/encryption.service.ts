import { KMS } from 'aws-sdk'; // AWS SDK v2
// For AWS SDK v3:
// import { KMSClient, EncryptCommand, DecryptCommand } from "@aws-sdk/client-kms";
import { KmsConfig } from '../config/kms.config';
import { logger } from '../common/utils/logger.util';
import { AuditService, AuditEventType, AuditEventDto } from '../audit/audit.service'; // Assuming AuditEventDto and Type are here
import { AUDIT_OUTCOME_SUCCESS, AUDIT_OUTCOME_FAILURE } from '../common/constants/audit.constants';


export class EncryptionService {
  private kms: KMS; // AWS SDK v2
  // private kmsClientV3: KMSClient; // For SDK v3
  private defaultKeyId: string;

  constructor(
    private kmsConfig: KmsConfig,
    private auditService: AuditService,
    ) {
    this.kms = new KMS({ // SDK v2
        region: kmsConfig.region,
        accessKeyId: kmsConfig.accessKeyId,
        secretAccessKey: kmsConfig.secretAccessKey,
    });
    // For SDK v3:
    // this.kmsClientV3 = new KMSClient({ region: kmsConfig.region });
    this.defaultKeyId = kmsConfig.defaultKeyId;
  }

  async encrypt(plaintext: string, keyId?: string): Promise<string> {
    const effectiveKeyId = keyId || this.defaultKeyId;
    try {
      // AWS SDK v2
      const response = await this.kms.encrypt({
        KeyId: effectiveKeyId,
        Plaintext: Buffer.from(plaintext, 'utf-8'),
      }).promise();
      
      // For SDK v3:
      // const command = new EncryptCommand({
      //   KeyId: effectiveKeyId,
      //   Plaintext: Buffer.from(plaintext, 'utf-8'),
      // });
      // const response = await this.kmsClientV3.send(command);

      if (response.CiphertextBlob) {
        await this.auditService.logEvent({
            eventType: AuditEventType.ENCRYPTION_SUCCESS,
            outcome: AUDIT_OUTCOME_SUCCESS,
            details: { keyId: effectiveKeyId, inputLength: plaintext.length },
        });
        return Buffer.from(response.CiphertextBlob as Uint8Array).toString('base64');
      }
      throw new Error('Encryption failed: CiphertextBlob is missing.');
    } catch (error) {
      logger.error(`KMS Encryption failed for keyId ${effectiveKeyId}:`, error);
      await this.auditService.logEvent({
        eventType: AuditEventType.ENCRYPTION_FAILURE,
        outcome: AUDIT_OUTCOME_FAILURE,
        details: { keyId: effectiveKeyId, error: (error as Error).message },
      });
      throw error; // Re-throw the error to be handled by the caller
    }
  }

  async decrypt(ciphertextBase64: string): Promise<string> {
    // Note: KMS decrypt does not require KeyId if ciphertext metadata contains it.
    // However, providing it can be a good practice for some scenarios.
    try {
      // AWS SDK v2
      const response = await this.kms.decrypt({
        CiphertextBlob: Buffer.from(ciphertextBase64, 'base64'),
      }).promise();

      // For SDK v3:
      // const command = new DecryptCommand({
      //   CiphertextBlob: Buffer.from(ciphertextBase64, 'base64'),
      // });
      // const response = await this.kmsClientV3.send(command);

      if (response.Plaintext) {
         await this.auditService.logEvent({
            eventType: AuditEventType.DECRYPTION_SUCCESS,
            outcome: AUDIT_OUTCOME_SUCCESS,
            details: { keyIdUsedForDecryption: response.KeyId, outputLength: response.Plaintext.length },
        });
        return Buffer.from(response.Plaintext as Uint8Array).toString('utf-8');
      }
      throw new Error('Decryption failed: Plaintext is missing.');
    } catch (error) {
      logger.error('KMS Decryption failed:', error);
       await this.auditService.logEvent({
        eventType: AuditEventType.DECRYPTION_FAILURE,
        outcome: AUDIT_OUTCOME_FAILURE,
        details: { error: (error as Error).message },
      });
      throw error; // Re-throw the error
    }
  }
}