import { DynamoDB } from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { Channel } from '../../domains/attendance/reaction-attendance-use-case';

const WhiteChannelTableName = process.env.WHITE_CHANNEL_TABLE_NAME!;
const Region = process.env.REGION!;

const DYNAMO = new DynamoDB.DocumentClient(
  {
    apiVersion: '2012-08-10',
    region: Region
  }
);

export class DynamodbWhiteChannelTable {

  public static async scan(): Promise<Channel[]> {

    const params: DocumentClient.ScanInput = {
      TableName: WhiteChannelTableName,
    };

    const response = await DYNAMO.scan(params).promise();
    return response.Items!.map(item => ({
      channel: item.channelId
    }));
  }

}
