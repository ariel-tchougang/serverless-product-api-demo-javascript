// src/handlers/update-item.mjs

import AWSXRay from 'aws-xray-sdk-core';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UpdateCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = AWSXRay.captureAWSv3Client(new DynamoDBClient({}));
const documentClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.TABLE_NAME;

/**
 * A simple example includes a HTTP get method to get one item by id from a DynamoDB table.
 */
export const updateItemHandler = async (event) => {
  if (event.httpMethod !== 'PUT') {
    throw new Error(`updateMethod only accept PUT method, you tried: ${event.httpMethod}`);
  }
  // All log statements are written to CloudWatch
  console.info('received:', event);
 
  // Get id from pathParameters from APIGateway because of `/{id}` at template.yaml
  const id = event.pathParameters.id;
  
  const product = JSON.parse(event.body);
 
  // Get the item from the table
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#get-property
  let response = {};

  try {
    
    const updateExpression = "set #product_name = :name";
    const ExpressionAttributeNames = {"#product_name": "name"};
    const expressionAttributeValues = { ":name": product.name };
    
    const params = {
      TableName: tableName,
      Key: { id: id },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    };
    
    response = await documentClient.send(new UpdateCommand(params));
    console.log('UpdateCommand response: ', response);

    response = {
      statusCode: 200,
      body: JSON.stringify({ id: id, name: product.name })
    };
  } catch (err) {
    response = manageErrors(err);
  }
 
  // All log statements are written to CloudWatch
  console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
  return response;
}

export const manageErrors = err => {
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
