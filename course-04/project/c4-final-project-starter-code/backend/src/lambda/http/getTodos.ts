import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getTodosForUser } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'
import { parseUserId } from '../../auth/utils'
import { TodoItemKey } from '../../models'

const logger = createLogger('getTodos.handler');

const encodeLastKey = (key: TodoItemKey): string => encodeURIComponent(JSON.stringify(key));
const decodeLastKey = (lastKey: string): TodoItemKey => {
    if (lastKey) {
        return JSON.parse(lastKey);
    }

    return null;
}

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        logger.info('getTodos.handler: ', event);

        const userId = parseUserId(event.headers.Authorization);
        const limit = event.queryStringParameters?.limit || '999';
        const lastKey = decodeLastKey(event.queryStringParameters?.lastKey);

        logger.info(`limit: ${limit}`);
        logger.info(`lastKey: ${JSON.stringify(lastKey)}`);

        const [todos, lastEvaluatedKey] = await getTodosForUser(userId, +limit, lastKey);

        return {
            statusCode: 200,
            body: JSON.stringify({
                items: todos,
                lastKey: encodeLastKey(lastEvaluatedKey)
            })
        }
    });

handler
    .use(cors({ credentials: true }))
    .use(httpErrorHandler({ logger }));
