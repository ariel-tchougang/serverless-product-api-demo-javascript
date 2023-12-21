// __tests__/unit/handlers/get-items.test.js

import { getItemsHandler, getAllItems, getItemById, manageErrors } from '../../../src/handlers/get-items.mjs';
import { DynamoDBDocumentClient, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

describe('Test getItemsHandler', function () {
    const ddbMock = mockClient(DynamoDBDocumentClient);

    beforeEach(() => {
        ddbMock.reset();
    });

    // Test for getting all items
    it('should get all items from the table', async () => {
        const items = [{ id: '1', name: 'Item 1' }, { id: '2', name: 'Item 2' }];

        ddbMock.on(ScanCommand, {
            TableName: expect.any(String)
        }).resolves({ Items: items });

        const event = {
            httpMethod: 'GET'
        };

        const result = await getItemsHandler(event);

        const expectedResult = {
            statusCode: 200,
            body: JSON.stringify(items)
        };

        expect(result).toEqual(expectedResult);
    });

    // Test for getting an item by ID
    it('should get an item by id from the table', async () => {
        const itemId = 'test-id';
        const item = { id: itemId, name: 'Test Item' };

        ddbMock.on(GetCommand, {
            TableName: expect.any(String),
            Key: { id: itemId }
        }).resolves({ Item: item });

        const event = {
            httpMethod: 'GET',
            pathParameters: { id: itemId }
        };

        const result = await getItemsHandler(event);

        const expectedResult = {
            statusCode: 200,
            body: JSON.stringify(item)
        };

        expect(result).toEqual(expectedResult);
    });
});
