import { Request } from 'express';
import { FeedItem } from './feed/models/FeedItem';
import { User } from './users/models/User';

export type AuthenticatedRequest = Request & { user?: any };

export const V0MODELS = [ FeedItem, User ];
