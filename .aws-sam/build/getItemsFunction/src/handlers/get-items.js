// Create clients and set shared const values outside of the handler.

// Get the DynamoDB table name from environment variables
const tableName = process.env.TABLE_NAME;

// Create a DocumentClient that represents the query to add an item
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

/**
 * A simple example includes:
 *  - a HTTP get method to get one item by id from a DynamoDB table.
 *  - a HTTP get method to get all items from a DynamoDB table.
 */
exports.getItemsHandler = async (event) => {
  if (event.httpMethod !== 'GET') {
    throw new Error(`getMethod only accept GET method, you tried: ${event.httpMethod}`);
  }
  
  // All log statements are written to CloudWatch
  console.info('received:', event);

  let response = {};
  try {
    
    if(event.pathParameters) {
      response = await exports.getItemById(event.pathParameters.id);
    } else {
      response = await exports.getAllItems();
    }
  } catch (err) {
    response = exports.manageErrors(err);
  }
 
  // All log statements are written to CloudWatch
  console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
  return response;
}

exports.getAllItems = async () => {

  console.info('entering getAllItems');
  
  let response = {};

  try {
    const params = {
        TableName : tableName
    };
    
    console.info('initiating scan');
    
    const data = await docClient.scan(params).promise();
    const items = data.Items;

    response = {
        statusCode: 200,
        body: JSON.stringify(items)
    };
  } catch (err) {
    response = exports.manageErrors(err);
  }
  
  return response;
}

exports.getItemById = async id => {

  console.info('entering getItemById');
  
  let response = {};
   
  try {
    const params = {
      TableName : tableName,
      Key: { id: id },
    };
    
    console.info('initiating get-item');
    
    const data = await docClient.get(params).promise();
    const item = data.Item;
   
    response = {
      statusCode: 200,
      body: JSON.stringify(item)
    };
    
  } catch (err) {
    response = exports.manageErrors(err);
  }
 
  return response;
}

exports.manageErrors = err => {
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
