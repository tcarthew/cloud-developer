import { createLogger } from '../../utils/logger'
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { verifyToken } from '../../auth/utils'
import * as middy from 'middy';
import { httpErrorHandler } from 'middy/middlewares';

const logger = createLogger('auth0Authorizer');

function createAuthPolicy(authorized: boolean, principalId: string): CustomAuthorizerResult {
    return {
        principalId: authorized ? principalId : 'user',
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: authorized ? 'Allow' : 'Deny',
                    Resource: '*'
                }
            ]
        }
    }
}

export const handler = middy(async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
    try {
        logger.info('Authorizing a user', event.authorizationToken)

        const jwtToken = await verifyToken(event.authorizationToken)

        return createAuthPolicy(true, jwtToken.sub);
    } catch (e) {
        logger.error('User not authorized', { error: e.message })

        return createAuthPolicy(false, 'user');
    }
});

handler.use(httpErrorHandler({ logger }));