import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { S3 } from 'aws-sdk';

const XAWS = AWSXRay.captureAWS(AWS)

export const createDocumentClient = (): DocumentClient => new XAWS.DynamoDB.DocumentClient();

export const createS3 = (): S3 => new XAWS.S3({ signatureVersion: 'v4' });