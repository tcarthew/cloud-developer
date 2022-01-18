import { createS3 } from '../helpers/factories';
import { createLogger } from '../utils/logger';

const logger = createLogger('attachmentUtils');

export const getSignedAttachmentUrl = (todoId: string, bucketName: string, expiration: number) => {
    try {
        const s3 = createS3();
        const signedUrl = s3.getSignedUrl('putObject', {
            Bucket: bucketName,
            Key: todoId,
            Expires: expiration
        });

        return signedUrl;
    } catch (err) {
        logger.error(err.message);
        throw err;
    }
}