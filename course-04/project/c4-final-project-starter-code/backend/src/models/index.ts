import { TodoItem } from './TodoItem';
import { TodoUpdate } from './TodoUpdate';

type TodoItemKey = Record<string, any>;
type QueryParams = {
    limit: number,
    lastKey: TodoItemKey,
    sort: string,
    order: string
}

export {
    QueryParams,
    TodoItem,
    TodoItemKey,
    TodoUpdate
}