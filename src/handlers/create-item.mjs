// src/handlers/create-item.mjs

import AWSXRay from 'aws-xray-sdk-core';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = AWSXRay.captureAWSv3Client(new DynamoDBClient({}));
const documentClient = DynamoDBDocumentClient.from(client);
import { v4 as uuidv4 } from 'uuid';
const tableName = process.env.TABLE_NAME;

/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */
export const createItemHandler = async (event) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }
    // All log statements are written to CloudWatch
    console.info('received:', event);

    // Get id and name from the body of the request
    const body = JSON.parse(event.body);
    const id = uuidv4()

    // Creates a new item, or replaces an old item with a new item
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
    let response = {};

    try {
        const params = {
            TableName : tableName,
            Item: { id : id, name: body.name }
        };
        
        response = await documentClient.send(new PutCommand(params));
        console.log('PutCommand response: ', response);

        response = {
            statusCode: 200,
            body: JSON.stringify({id : id, name: body.name})
        };
    } catch (err) {
        response = manageErrors(err);
    }

    // All log statements are written to CloudWatch
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
};

const manageErrors = err => {
  console.error(err);
  if (err.name === 'ResourceNotFoundException') {
    return {
      statusCode: 404,
      body: "Unable to call DynamoDB. Table resource not found."
    };
  } 
  
  return {
    statusCode: 500,
    body: "An unknown error occurred."
  };
}
