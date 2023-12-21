// __tests__/unit/handlers/create-item.test.js

import { createItemHandler, manageErrors } from '../../../src/handlers/create-item.mjs';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { v4 as uuidv4 } from 'uuid';

describe('Test createItemHandler', function () {
    const ddbMock = mockClient(DynamoDBDocumentClient);

    beforeEach(() => {
        ddbMock.reset();
    });

    // This test invokes createItemHandler() and compares the result
    it('should add a new item to the table', async () => {
        const itemId = uuidv4();
        const itemName = 'name1';
        const returnedItem = { id: itemId, name: itemName };

        // Mock the DynamoDB PutCommand
        ddbMock.on(PutCommand, {
            TableName: expect.any(String),
            Item: expect.objectContaining({ id: expect.any(String), name: itemName })
        }).resolves(returnedItem);

        const event = {
            httpMethod: 'POST',
            body: JSON.stringify({ name: itemName })
        };

        // Invoke createItemHandler()
        const result = await createItemHandler(event);

        const expectedResult = {
            statusCode: 200,
            body: JSON.stringify({ id: expect.any(String), name: itemName })
        };

        // Compare the result with the expected result
        expect(result).toEqual(expectedResult);
    });
});
