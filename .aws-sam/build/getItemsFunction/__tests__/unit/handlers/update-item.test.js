// Import all functions from update-item.js 
const lambda = require('../../../src/handlers/update-item.js'); 
// Import dynamodb from aws-sdk 
const dynamodb = require('aws-sdk/clients/dynamodb'); 

// This includes all tests for updateItemHandler() 
describe('Test updateItemHandler', function () { 
    let putSpy; 
 
    // Test one-time setup and teardown, see more in https://jestjs.io/docs/en/setup-teardown 
    beforeAll(() => { 
        // Mock dynamodb put methods
        // https://jestjs.io/docs/en/jest-object.html#jestspyonobject-methodname 
        putSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'put'); 
    }); 
 
    // Clean up mocks 
    afterAll(() => { 
        putSpy.mockRestore(); 
    }); 
 
    // This test invokes updateItemHandler() and compare the result  
    it('should update item name in the table', async () => { 
        const returnedItem = { id: 'id1', name: 'updated-name' }; 
 
        // Return the specified value whenever the spied put function is called 
        putSpy.mockReturnValue({ 
            promise: () => Promise.resolve(returnedItem) 
        }); 
 
        const event = { 
            httpMethod: 'POST',
            pathParameters: { 
                id: 'id1' 
            },
            body: '{"name": "original-name"}' 
        }; 
     
        // Invoke updateItemHandler() 
        const result = await lambda.updateItemHandler(event); 
        const expectedResult = { 
            statusCode: 200, 
            body: JSON.stringify(returnedItem) 
        }; 
 
        // Compare the result with the expected result 
        expect(result).toEqual(expectedResult); 
    }); 
}); 
 