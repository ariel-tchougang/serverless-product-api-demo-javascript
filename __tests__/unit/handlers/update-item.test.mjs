// __tests__/unit/handlers/update-item.test.js

import { updateItemHandler } from '../../../src/handlers/update-item.mjs';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

describe('Test updateItemHandler', function () {
    const ddbMock = mockClient(DynamoDBDocumentClient);

    beforeEach(() => {
        ddbMock.reset();
    });

    // This test invokes updateItemHandler() and compares the result
    it('should update an item in the table', async () => {
        const itemId = 'test-id';
        const itemName = 'updated-name';
        const updatedItem = { id: itemId, name: itemName };

        // Mock the DynamoDB UpdateCommand
        ddbMock.on(UpdateCommand, {
            TableName: expect.any(String),
            Key: { id: itemId },
            UpdateExpression: expect.any(String),
            ExpressionAttributeNames: expect.any(Object),
            ExpressionAttributeValues: expect.any(Object)
        }).resolves({
            Attributes: updatedItem
        });

        const event = {
            httpMethod: 'PUT',
            pathParameters: { id: itemId },
            body: JSON.stringify({ name: itemName })
        };

        // Invoke updateItemHandler()
        const result = await updateItemHandler(event);

        const expectedResult = {
            statusCode: 200,
            body: JSON.stringify(updatedItem)
        };

        // Compare the result with the expected result
        expect(result).toEqual(expectedResult);
    });
});
