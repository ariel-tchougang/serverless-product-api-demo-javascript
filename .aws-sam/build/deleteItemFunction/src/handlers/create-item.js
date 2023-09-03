// Create clients and set shared const values outside of the handler.

// Create a DocumentClient that represents the query to add an item
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();
const uuid = require('uuid');

// Get the DynamoDB table name from environment variables
const tableName = process.env.TABLE_NAME;

/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */
exports.createItemHandler = async (event) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }
    // All log statements are written to CloudWatch
    console.info('received:', event);

    // Get id and name from the body of the request
    const body = JSON.parse(event.body);
    const id = uuid.v4();
    const name = body.name;

    // Creates a new item, or replaces an old item with a new item
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
    let response = {};

    try {
        const params = {
            TableName : tableName,
            Item: { id : id, name: name }
        };
    
        await docClient.put(params).promise();
    
        response = {
            statusCode: 200,
            body: JSON.stringify({id : id})
        };
    } catch (err) {
        response = exports.manageErrors(err);
    }

    // All log statements are written to CloudWatch
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
};

exports.manageErrors = err => {
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
