import { create, getAll, update } from './todosAcess'
// import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models'
import { CreateTodoRequest, UpdateTodoRequest } from '../requests'
import { createLogger } from '../utils/logger'
import { v4 as uuid } from 'uuid'
// import * as createError from 'http-errors'
const logger = createLogger('Todos');

export const getTodosForUser = async (userId: string): Promise<TodoItem[]> => {
    logger.info('getTodosForUser');
    try {
        return getAll(userId);    
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
