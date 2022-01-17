import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodosForUser } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'
import { parseUserId } from '../../auth/utils'

const logger = createLogger('getTodos.handler');

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        logger.info('getTodos.handler: ', event);

        try {
            const userId = parseUserId(event.headers.Authorization);
            const todos = await getTodosForUser(userId);

            return {
                statusCode: 200,
                body: JSON.stringify({ items: todos })
            }
        } catch (err) {
            logger.error(err.message);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: err.message })
            };
        }
    });

handler.use(
    cors({
        credentials: true
    })
)
