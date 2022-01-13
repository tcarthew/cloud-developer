import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { createDocumentClient } from '../helpers/factories';

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic