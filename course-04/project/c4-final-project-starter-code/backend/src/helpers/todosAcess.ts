import { createLogger } from '../utils/logger';
import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from '../models/TodoUpdate';
import { createDocumentClient } from '../helpers/factories';

const logger = createLogger('TodosAccess');
const { TODOS_TABLE: TableName, TODOS_CREATED_AT_INDEX: IndexName } = process.env;

export const getAll = async (userId: string): Promise<TodoItem[]> => {
    logger.info('getAll');
    const db = createDocumentClient();
    try {
        const result = await db.query({ 
            TableName,
            IndexName,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: { ':userId' : userId }

        }).promise();

        return result.Items.map(i => i as TodoItem);
    } catch (err) {
        logger.error(err.message);
        throw err;
    }
}

export const update = async (id: string, userId: string, todo: TodoUpdate): Promise<TodoItem> => {
    return null;
    // const db = createDocumentClient();
    try {
        logger.info(`id: ${id};userId:${userId}todo:${JSON.stringify(todo)}`);
    } catch (err) {
        logger.error(err.message);
        throw err;
    }
}