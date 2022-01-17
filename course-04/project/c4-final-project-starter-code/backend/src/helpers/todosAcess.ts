import { createLogger } from '../utils/logger';
import { TodoItem, TodoUpdate } from '../models';
import { createDocumentClient } from '../helpers/factories';
import { AttributeMap } from 'aws-sdk/clients/dynamodb';

const logger = createLogger('TodosAccess');
const { TODOS_TABLE: TableName, TODOS_CREATED_AT_INDEX: IndexName } = process.env;

function transform(value: AttributeMap): TodoItem {
    const keys = Object.keys(value);
    const result = {};

    keys.forEach(k => {
        result[k] = value[k];
    });

    return result as TodoItem;
}

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