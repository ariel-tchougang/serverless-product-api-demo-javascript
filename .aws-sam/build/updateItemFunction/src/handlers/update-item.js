// Create clients and set shared const values outside of the handler.

// Get the DynamoDB table name from environment variables
const tableName = process.env.TABLE_NAME;

// Create a DocumentClient that represents the query to add an item
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

/**
 * A simple example includes a HTTP get method to get one item by id from a DynamoDB table.
 */
exports.updateItemHandler = async (event) => {
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
    const params = {
      TableName : tableName,
      Key: { id: id },
      UpdateExpression: "set #n = :n",
      ExpressionAttributeValues: {":n": product.name},
      ExpressionAttributeNames: {"#n": "name"},
      ReturnValues: "UPDATED_NEW"
    };
    
    const data = await docClient.update(params).promise();

    response = {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (err) {
    response = exports.manageErrors(err);
  }
 
  // All log statements are written to CloudWatch
  console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
  return response;
}

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
