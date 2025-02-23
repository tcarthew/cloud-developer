import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests'
import { createTodo } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'
import { parseUserId } from '../../auth/utils'

const logger = createLogger('createTodo.handler');

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

        const userId = parseUserId(event.headers.Authorization);
        const newTodo: CreateTodoRequest = JSON.parse(event.body)
        const result = await createTodo(userId, newTodo);

        return {
            statusCode: 201,
            body: JSON.stringify({ item: result })
        }
    }
);

handler
    .use(cors({ credentials: true }))
    .use(httpErrorHandler({ logger }));
