import { DynamoDB } from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { Channel, CheckContent } from '../../domains/attendance/reaction-attendance-use-case';
import * as Console from 'console';

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

  public static async getCheckContent(channelId: string): Promise<CheckContent> {

    const params: DocumentClient.GetItemInput = {
      TableName: WhiteChannelTableName,
      Key: {channelId: channelId}
    };

    try {

      const response = await DYNAMO.get(params).promise();
      return {
        reaction: response.Item!.reaction
      };
    } catch (e) {
      Console.log(e);
      return {
        reaction: ''
      };
    }
  }

}
