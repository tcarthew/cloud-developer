import { createLogger } from '../utils/logger';
import { QueryParams, TodoItem, TodoItemKey, TodoUpdate } from '../models';
import { createDocumentClient } from '../helpers/factories';
import { AttributeMap } from 'aws-sdk/clients/dynamodb';

const logger = createLogger('TodosAccess');
const { 
    TODOS_TABLE: TableName,
    TODOS_CREATED_AT_INDEX: CreatedAtIndexName,
    TODOS_DUEDATE_INDEX: DueDateIndexName
} = process.env;

function transform(value?: AttributeMap): TodoItem {
    if (!value) {
        return null;
    }

    const keys = Object.keys(value);
    const result = {};

    keys.forEach(k => {
        result[k] = value[k];
    });

    return result as TodoItem;
}

export const getAll = async (userId: string, params: QueryParams): Promise<[TodoItem[], TodoItemKey]> => {
    logger.info('getAll');
    const db = createDocumentClient();
    try {
        
        const result = await db.query({ 
            TableName,
            IndexName: params.sort.toLowerCase() === 'duedate' ? DueDateIndexName : CreatedAtIndexName,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: { ':userId' : userId },
            Limit: params.limit,
            ExclusiveStartKey: params.lastKey,
            ScanIndexForward: params.order.toLowerCase() === 'asc'
        }).promise();

        return [result.Items.map(i => i as TodoItem), result.LastEvaluatedKey];
    } catch (err) {
        logger.error(err.message);
        throw err;
    }
}

export const create = async (newTodo: TodoItem): Promise<TodoItem> => {
    logger.info('create todo: ', JSON.stringify(newTodo));
    const db = createDocumentClient();
    try {
        await db.put({
            TableName,
            Item: newTodo
        }).promise();

        return newTodo;
    } catch (err) {
        logger.error(err.message);
        throw err;
    }
}

export const update = async (id: string, userId: string, todoUpdate: TodoUpdate): Promise<TodoItem> => {
    logger.info(`update todo ${id}; user: ${userId}, todo: ${JSON.stringify(todoUpdate)}`);
    const db = createDocumentClient();
    try {
        const result = await db.update({
            TableName,
            Key: {
                'todoId': id,
                'userId': userId
            },
            UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeNames: {
                '#name': 'name'
            },
            ExpressionAttributeValues: {
                ':name': todoUpdate.name,
                ':dueDate': todoUpdate.dueDate,
                ':done': todoUpdate.done
            },
            ReturnValues: 'ALL_NEW'
        }).promise();

        return transform(result.Attributes);
    } catch (err) {
        logger.error(err.message);
        throw err;
    }
}

export const updateAttachementUrl = async (id: string, userId: string, attachmentUrl: string): Promise<void> => {
    logger.info(`update todo ${id}; user: ${userId}, url: ${attachmentUrl}`);
    const db = createDocumentClient();
    try {
        await db.update({
            TableName,
            Key: {
                'todoId': id,
                'userId': userId
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': attachmentUrl,
            },
            ReturnValues: 'NONE'
        }).promise();
    } catch (err) {
        logger.error(err.message);
        throw err;
    }
}

export const remove = async (id: string, userId: string): Promise<void> => {
    logger.info(`delete todo ${id}; user: ${userId}`);
    const db = createDocumentClient();
    try {
        await db.delete({
            TableName,
            Key: {
                'todoId': id,
                'userId': userId
            }
        }).promise();
    } catch(err) {
        logger.error(err.message);
        throw err;
    }

}