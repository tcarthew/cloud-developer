import axios from 'axios';
import { decode, verify } from 'jsonwebtoken'
import { createLogger } from '../utils/logger';
import { Jwt } from './Jwt';
import { JwtPayload } from './JwtPayload'

const logger = createLogger('auth.utils');

const certToPEM = (cert) =>
    `-----BEGIN CERTIFICATE-----\n${cert.match(/.{1,64}/g).join('\n')}\n-----END CERTIFICATE-----\n`;

async function getJwksSigningKey(kid: string) {
    const jwksUrl = ''
    try {
        const response = await axios.get(jwksUrl, {});
        const { keys } = response.data;

        if (!keys || !keys?.length) {
            throw new Error('Invalid jwks, no signature keys available');
        }

        const signingKey = keys
            .filter(key => 
                key.use === 'sig' && 
                key.kty === 'RSA' && 
                key.kid && (key?.x5c?.length || (key?.n && key.e))
            )
            .map(key => ({
                kid: key.kid,
                nbf: key.nbf,
                publicKey: certToPEM(key.x5c)
            }))
            .find(key => key.kid === kid);
        
        if (!signingKey) {
            throw Error('Unable to find a matching signing key');
        }

        return signingKey;
    } catch (err) {
        logger.error('Error fetching jwks: ', err.message);
    }
}

export const parseToken = (jwtToken: string): string => {
    if (!jwtToken) {
        throw new Error('Authorization token required');
    }

    const [type, token] = jwtToken.split(' ');

    if (type.toLocaleLowerCase() !== 'bearer') {
        throw new Error('Invalid authorization type specified');
    }

    return token;
}
/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export const parseUserId = (jwtToken: string): string => {
    const token = decode(parseToken(jwtToken)) as JwtPayload

    return token.sub
}

export const verifyToken = async (authHeader: string): Promise<JwtPayload> => {
    const token = parseToken(authHeader)
    const jwt: Jwt = decode(token, { complete: true }) as Jwt
    const { header } = jwt;

    if (header.alg !== 'RS256') {
        throw new Error('Invalid signing algorithm');
    }
    
    try {
        const signingKey = await getJwksSigningKey(header.kid);

        return verify(token, signingKey, { algorithms: ['RS256'] }) as JwtPayload;
    } catch (err) {
        logger.error('Verify token failed: ', err.message);
        throw err;
    }
}