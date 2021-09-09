import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { AuthRouter, requireAuth } from './auth.router';
import { AuthenticatedRequest } from '../../model.index';

const router: Router = Router();

router.use('/auth', AuthRouter);

router.get('/', async (req: Request, res: Response) => {
    res.send('users');
});

router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const item = await User.findByPk(id);

    if (item.email !== req.user.email) {
        res.status(403).send({ message: 'Invalid authentication token' });
    }

    res.send(item);
});

export const UserRouter: Router = router;