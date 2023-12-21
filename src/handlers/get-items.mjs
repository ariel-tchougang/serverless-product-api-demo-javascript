// src/handlers/get-items.mjs

import AWSXRay from 'aws-xray-sdk-core';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, ScanCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = AWSXRay.captureAWSv3Client(new DynamoDBClient({}));
const documentClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.TABLE_NAME;

/**
 * A simple example includes:
 *  - a HTTP get method to get one item by id from a DynamoDB table.
 *  - a HTTP get method to get all items from a DynamoDB table.
 */
export const getItemsHandler = async (event) => {
  if (event.httpMethod !== 'GET') {
    throw new Error(`getMethod only accept GET method, you tried: ${event.httpMethod}`);
  }
  
  // All log statements are written to CloudWatch
  console.info('received:', event);

  let response = {};
  try {
    
    if(event.pathParameters) {
      response = await getItemById(event.pathParameters.id);
    } else {
      response = await getAllItems();
    }
  } catch (err) {
    response = manageErrors(err);
  }
 
  // All log statements are written to CloudWatch
  console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
  return response;
}

export const getAllItems = async () => {

  console.info('entering getAllItems');
  
  let response = {};

  try {
    const params = {
        TableName : tableName
    };
    
    console.info('initiating scan');
    
    response = await documentClient.send(new ScanCommand(params));
    console.log('ScanCommand response: ', response);
    const items = response.Items;

    response = {
        statusCode: 200,
        body: JSON.stringify(items)
    };
  } catch (err) {
    response = manageErrors(err);
  }
  
  return response;
}

export const getItemById = async id => {

  console.info('entering getItemById');
  
  let response = {};
   
  try {
    const params = {
      TableName : tableName,
      Key: { id: id },
    };
    
    console.info('initiating get-item');
    
    response = await documentClient.send(new GetCommand(params));
    console.log('GetCommand response: ', response);
    const item = response.Item;
   
    response = {
      statusCode: 200,
      body: JSON.stringify(item)
    };
    
  } catch (err) {
    response = manageErrors(err);
  }
 
  return response;
}

export const manageErrors = err => {
  console.error('Caught error: ', err);
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
