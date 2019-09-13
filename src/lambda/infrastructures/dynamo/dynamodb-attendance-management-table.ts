import { DynamoDB } from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import {
  ReactDateExtension,
  ReactionContent,
  UserProfile
} from '../../domains/attendance/reaction-attendance-use-case';
import * as Console from 'console';

const AttendanceManagementTable = process.env.ATTENDANCE_MANAGEMENT_TABLE_NAME!;
const Region = process.env.REGION!;

const DYNAMO = new DynamoDB.DocumentClient(
  {
    apiVersion: '2012-08-10',
    region: Region
  }
);

export class DynamodbAttendanceManagementTable {

  public static async createStart(reaction: ReactionContent, extension: ReactDateExtension, profile: UserProfile): Promise<void> {
    const param: DocumentClient.PutItemInput = {
      TableName: AttendanceManagementTable,
      Item: {
        attendanceId: `${reaction.user}-${extension.reactAtDay.toMillis()}`,
        userId: reaction.user,
        name: profile.name,
        image48: profile.image48,
        startAt: extension.reactAt.toMillis(),
        startAtDay: extension.reactAtDay.toMillis(),
        startAtMonth: extension.reactAtMonth.toMillis(),
        startObject: reaction
      }
    };
    try {
      await DYNAMO.put(param).promise();
    } catch (e) {
      Console.log(e);
    }
  }

  public static async updateEnd(reaction: ReactionContent, extension: ReactDateExtension): Promise<void> {
    const param: DocumentClient.UpdateItemInput = {
      TableName: AttendanceManagementTable,
      Key: {attendanceId: `${reaction.user}-${extension.reactAtDay.toMillis()}`},
      ConditionExpression: 'attribute_exists(startAt)',
      UpdateExpression: [
        'SET endAt = :endAt',
        'endObject = :endObject'
      ].join(', '),
      ExpressionAttributeValues: {
        ':endAt': extension.reactAt.toMillis(),
        ':endObject': reaction,
      }
    };
    try {
      await DYNAMO.update(param).promise();
    } catch (e) {
      Console.log(e);
    }
  }

}
