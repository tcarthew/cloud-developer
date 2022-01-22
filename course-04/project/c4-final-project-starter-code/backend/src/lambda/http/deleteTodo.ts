import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { deleteTodo } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'
import { parseUserId } from '../../auth/utils'

const logger = createLogger('deleteTodo.handler');

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const { todoId } = event.pathParameters;
        const userId = parseUserId(event.headers.Authorization);

        await deleteTodo(todoId, userId);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: `Todo ${todoId} deleted.` })
        }
    }
);

handler
    .use(cors({ credentials: true }))
    .use(httpErrorHandler({ logger }));
