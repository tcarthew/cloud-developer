import { create, getAll, remove, update, updateAttachementUrl } from './todosAcess'
import { getSignedAttachmentUrl } from './attachmentUtils';
import { TodoItem, TodoItemKey } from '../models'
import { CreateTodoRequest, UpdateTodoRequest } from '../requests'
import { createLogger } from '../utils/logger'
import { v4 as uuid } from 'uuid'

const logger = createLogger('Todos');
const { ATTACHMENT_S3_BUCKET, SIGNED_URL_EXPIRATION } = process.env;

export const getTodosForUser = async (userId: string, limit: number, lastKey: TodoItemKey): Promise<[TodoItem[], TodoItemKey]> => {
    logger.info('getTodosForUser');
    try {
        return getAll(userId, limit, lastKey);    
    } catch(err) {
        logger.error(err.message);
        throw err;
    }
}

export const createTodo = async (userId: string, todoRequest: CreateTodoRequest): Promise<TodoItem> => {
    logger.info('createTodo');
    try {
        const todoItem: TodoItem = {
            todoId: uuid(),
            userId,
            done: false,
            createdAt: new Date().toUTCString(),
            ...todoRequest
        }

        return create(todoItem);
    } catch (err) {
        logger.error(err.message);
        throw err;
    }
}

export const updateTodo = async (id: string, userId: string, todoRequest: UpdateTodoRequest): Promise<TodoItem> => {
    logger.info('updateTodo');
    try {
        return update(id, userId, todoRequest);
    } catch (err) {
        logger.error(err.message);
        throw err;
    }
}

export const deleteTodo = async (id: string, userId: string): Promise<void> => {
    logger.info('deleteTodo');
    try {
        await remove(id, userId);
    } catch (err) {
        logger.error(err.message);
        throw err;
    }
}

export const createAttachmentPresignedUrl = async (id: string, userId: string): Promise<string> => {
    logger.info('createAttachmentPresignedUrl');
    try {
        const attachmentUrl = `https://${ATTACHMENT_S3_BUCKET}.s3.amazonaws.com/${id}`;
        
        await updateAttachementUrl(id, userId, attachmentUrl);

        return getSignedAttachmentUrl(id, ATTACHMENT_S3_BUCKET, +SIGNED_URL_EXPIRATION);
    } catch (err) {
        logger.error(err.message);
        throw err;
    }
}