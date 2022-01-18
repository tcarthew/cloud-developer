import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl } from '../../helpers/todos'
import { parseUserId } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('generateUploadUrl.handler');

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        try {
            const todoId = event.pathParameters.todoId
            const userId = parseUserId(event.headers.Authorization);
            const uploadUrl = await createAttachmentPresignedUrl(todoId, userId);

            return {
                statusCode: 200,
                body: JSON.stringify({ uploadUrl })
            }

        } catch (err) {
            logger.error(err.message);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: err.message })
            };
        }
    }
)

handler
    .use(httpErrorHandler())
    .use(
        cors({
            credentials: true
        })
    )
