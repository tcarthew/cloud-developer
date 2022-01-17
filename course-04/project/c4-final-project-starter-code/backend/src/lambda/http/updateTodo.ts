import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../helpers/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from '../../utils/logger'
import { parseUserId } from '../../auth/utils'

const logger = createLogger('updateTodo.handler');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { todoId } = event.pathParameters;
        const userId = parseUserId(event.headers.Authorization);
        const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
        const result = await updateTodo(todoId, userId, updatedTodo);

        return {
            statusCode: 200,
            body: JSON.stringify({ todo: result })
        }
    } catch (err) {
        logger.error(err.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: err.message })
        }
    }
});

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
