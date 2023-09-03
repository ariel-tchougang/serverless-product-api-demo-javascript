// Import all functions from get-items.js 
const lambda = require('../../../src/handlers/get-items.js'); 
// Import dynamodb from aws-sdk 
const dynamodb = require('aws-sdk/clients/dynamodb'); 
 
// This includes all tests for getItemsHandler() 
describe('Test getItemsHandler', () => { 
    let getSpy; 
    let scanSpy; 
 
    // Test one-time setup and teardown, see more in https://jestjs.io/docs/en/setup-teardown 
    beforeAll(() => { 
        // Mock dynamodb get method
        // https://jestjs.io/docs/en/jest-object.html#jestspyonobject-methodname 
        getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get'); 
        scanSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'scan'); 
    }); 
 
    // Clean up mocks 
    afterAll(() => { 
        getSpy.mockRestore(); 
        scanSpy.mockRestore(); 
    }); 
 
    // This test invokes getItemsHandler() and compare the result  
    it('should get item by id', async () => { 
        const item = { id: 'id1', name: 'name1' }; 
 
        // Return the specified value whenever the spied get function is called 
        getSpy.mockReturnValue({ 
            promise: () => Promise.resolve({ Item: item }) 
        }); 
 
        const event = { 
            httpMethod: 'GET', 
            pathParameters: { 
                id: 'id1' 
            } 
        } 
 
        // Invoke getItemsHandler() 
        const result = await lambda.getItemsHandler(event); 
 
        const expectedResult = { 
            statusCode: 200, 
            body: JSON.stringify(item) 
        }; 
 
        // Compare the result with the expected result 
        expect(result).toEqual(expectedResult); 
    });
 
    it('should return ids', async () => { 
        const items = [{ id: 'id1', name: 'name1' }, { id: 'id2', name: 'name2' }]; 
 
        // Return the specified value whenever the spied scan function is called 
        scanSpy.mockReturnValue({ 
            promise: () => Promise.resolve({ Items: items }) 
        }); 
 
        const event = { 
            httpMethod: 'GET' 
        } 
 
        // Invoke helloFromLambdaHandler() 
        const result = await lambda.getAllItemsHandler(event); 
 
        const expectedResult = { 
            statusCode: 200, 
            body: JSON.stringify(items) 
        }; 
 
        // Compare the result with the expected result 
        expect(result).toEqual(expectedResult); 
    });  
}); 
 