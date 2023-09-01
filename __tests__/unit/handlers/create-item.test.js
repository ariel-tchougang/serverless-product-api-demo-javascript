// Import all functions from create-item.js 
const lambda = require('../../../src/handlers/create-item.js'); 
// Import dynamodb from aws-sdk 
const dynamodb = require('aws-sdk/clients/dynamodb'); 
const uuid = require('uuid');
 
// This includes all tests for createItemHandler() 
describe('Test createItemHandler', function () { 
    let postSpy; 
 
    // Test one-time setup and teardown, see more in https://jestjs.io/docs/en/setup-teardown 
    beforeAll(() => { 
        // Mock dynamodb put method
        // https://jestjs.io/docs/en/jest-object.html#jestspyonobject-methodname 
        postSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'put'); 
    }); 
 
    // Clean up mocks 
    afterAll(() => { 
        postSpy.mockRestore(); 
    }); 
 
    // This test invokes createItemHandler() and compare the result  
    it('should add itemId to the table', async () => { 
        const itemId = uuid.v4();
        const returnedItem = { id: itemId, name: 'name1' }; 
 
        // Return the specified value whenever the spied post function is called 
        postSpy.mockReturnValue({ 
            promise: () => Promise.resolve(returnedItem) 
        }); 
 
        const event = { 
            httpMethod: 'POST', 
            body: '{"name": "name1"}' 
        }; 
     
        // Invoke createItemHandler() 
        const result = await lambda.createItemHandler(event); 
        const expectedResult = { 
            statusCode: 200, 
            body: JSON.stringify(returnedItem) 
        }; 
 
        // Compare the result with the expected result 
        expect(result).toEqual(expectedResult); 
    }); 
}); 
 