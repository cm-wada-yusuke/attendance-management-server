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

  public static async scan(): Promise<string[]> {

    const params: DocumentClient.ScanInput = {
      TableName: WhiteChannelTableName,
      AttributesToGet: ['channelId']
    };

    const response = await DYNAMO.scan(params).promise();
    return response.Items!.map(item => item.channelId);
  }

  public static async get(channelId: string): Promise<Channel> {
    const param: DocumentClient.GetItemInput = {
      TableName: WhiteChannelTableName,
      Key: {channelId}
    };

    const response = await DYNAMO.get(param).promise();
    const item = response.Item!;
    return {
      channel: item.channelId,
      startReactionList: item.startReactionList ? item.startReactionList as string[] : [],
      endReactionList: item.endReactionList ? item.endReactionList as string[] : []
    }
  }

}
