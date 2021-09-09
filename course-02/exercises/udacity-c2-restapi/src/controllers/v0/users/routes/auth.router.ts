import { Router, Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { NextFunction } from 'connect';
import * as EmailValidator from 'email-validator';
import { User } from '../models/User';
import { config } from '../../../../config/config';
import { AuthenticatedRequest } from '../../model.index';

const router: Router = Router();
const SALT_ROUNDS = 10;

async function generatePassword(plainTextPassword: string): Promise<string> {
    return bcrypt.hash(plainTextPassword, SALT_ROUNDS);
}

async function comparePasswords(plainTextPassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hash);
}

function generateJWT(user: User): string {
    return jwt.sign(user.toJSON(), config.jwt.secret);
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    if (!req.headers || !req.headers.authorization){
        return res.status(401).send({ message: 'No authorization headers.' });
    }
    
    const token_bearer = req.headers.authorization.split(' ');

    if(token_bearer.length != 2){
        return res.status(401).send({ message: 'Malformed token.' });
    }
    
    const token = token_bearer[1];

    return jwt.verify(token, config.jwt.secret, (err, decoded) => {
      if (err) {
        return res.status(500).send({ auth: false, message: 'Failed to authenticate.' });
      }

      req.user = decoded;

      return next();
    });
}

router.get('/verification', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    return res.status(200).send({ auth: true, message: 'Authenticated.', user: req.user });
});

router.post('/login', async (req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;

    // check email is valid
    if (!email || !EmailValidator.validate(email)) {
        return res.status(400).send({ auth: false, message: 'Email is required or malformed' });
    }

    // check email password valid
    if (!password) {
        return res.status(400).send({ auth: false, message: 'Password is required' });
    }

    const user = await User.findByPk(email);

    // check that user exists
    if(!user) {
        return res.status(401).send({ auth: false, message: 'Unauthorized' });
    }

    // check that the password matches
    const authValid = await comparePasswords(password, user.password_hash)

    if(!authValid) {
        return res.status(401).send({ auth: false, message: 'Unauthorized' });
    }

    // Generate JWT
    const jwt = generateJWT(user);

    res.status(200).send({ auth: true, token: jwt, user: user.short()});
});

//register a new user
router.post('/', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // check email is valid
    if (!email || !EmailValidator.validate(email)) {
        return res.status(400).send({ auth: false, message: 'Email is required or malformed' });
    }

    // check email password valid
    if (!password) {
        return res.status(400).send({ auth: false, message: 'Password is required' });
    }

    // find the user
    const user = await User.findByPk(email);
    // check that user doesnt exists
    if(user) {
        return res.status(422).send({ auth: false, message: 'User may already exist' });
    }

    const password_hash = await generatePassword(password);
    const newUser = await new User({ email: email, password_hash: password_hash });

    let savedUser;
    try {
        savedUser = await newUser.save();
    } catch (e) {
        throw e;
    }

    // Generate JWT
    const jwt = generateJWT(savedUser);

    res.status(201).send({token: jwt, user: savedUser.short()});
});

router.get('/', async (_: Request, res: Response) => {
    res.send('auth')
});

export const AuthRouter: Router = router;