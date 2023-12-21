// __tests__/unit/handlers/delete-item.test.js

import { deleteItemHandler, manageErrors } from '../../../src/handlers/delete-item.mjs';
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

describe('Test deleteItemHandler', function () {
    const ddbMock = mockClient(DynamoDBDocumentClient);

    beforeEach(() => {
        ddbMock.reset();
    });

    // This test invokes deleteItemHandler() and compares the result
    it('should delete an item from the table', async () => {
        const itemId = 'test-id';

        // Mock the DynamoDB DeleteCommand
        ddbMock.on(DeleteCommand, {
            TableName: expect.any(String),
            Key: { id: itemId }
        }).resolves({});

        const event = {
            httpMethod: 'DELETE',
            pathParameters: { id: itemId }
        };

        // Invoke deleteItemHandler()
        const result = await deleteItemHandler(event);

        const expectedResult = {
            statusCode: 200,
            body: JSON.stringify({})
        };

        // Compare the result with the expected result
        expect(result).toEqual(expectedResult);
    });
});
