// src/handlers/delete-item.mjs

import AWSXRay from 'aws-xray-sdk-core';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = AWSXRay.captureAWSv3Client(new DynamoDBClient({}));
const documentClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.TABLE_NAME;

/**
 * A simple example includes a HTTP DELETE method to delete one item by id from a DynamoDB table.
 */
export const deleteItemHandler = async (event) => {
  if (event.httpMethod !== 'DELETE') {
    throw new Error(`deleteMethod only accept DELETE method, you tried: ${event.httpMethod}`);
  }
  // All log statements are written to CloudWatch
  console.info('received:', event);
 
  // Get id from pathParameters from APIGateway because of `/{id}` at template.yaml
  const id = event.pathParameters.id;
 
  // Get the item from the table
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#get-property
  let response = {};

  try {
    const params = {
      TableName : tableName,
      Key: { id: id },
    };
    
    response = await documentClient.send(new DeleteCommand(params));
    console.log('DeleteCommand response: ', response);

    response = {
      statusCode: 200,
      body: JSON.stringify({})
    };
  } catch (err) {
    response = manageErrors(err);
  }
 
  // All log statements are written to CloudWatch
  console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
  return response;
}

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
