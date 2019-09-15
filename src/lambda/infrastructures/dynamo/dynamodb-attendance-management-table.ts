import { DynamoDB } from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import {
  ReactDateExtension,
  ReactionContent,
  UserProfile
} from '../../domains/attendance/reaction-attendance-use-case';
import * as Console from 'console';
import { DateTime } from 'luxon';
import { Attendance } from '../../domains/attendance/get-user-attendance-use-case';

const AttendanceManagementTable = process.env.ATTENDANCE_MANAGEMENT_TABLE_NAME!;
const Region = process.env.REGION!;

const DynamoDBClient = new DynamoDB.DocumentClient(
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
        displayName: profile.displayName,
        image48: profile.image48,
        startAt: extension.reactAt.toMillis(),
        startAtDay: extension.reactAtDay.toMillis(),
        startAtMonth: extension.reactAtMonth.toMillis(),
        startObject: reaction
      }
    };
    try {
      await DynamoDBClient.put(param).promise();
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
      await DynamoDBClient.update(param).promise();
    } catch (e) {
      Console.log(e);
    }
  }

  public static async listByNameIndex(name: string, month: DateTime): Promise<Attendance[]> {
    Console.log('params', name, month, month.toISO(), month.toMillis());
    const param: DocumentClient.QueryInput = {
      TableName: AttendanceManagementTable,
      Limit: 31,
      IndexName: 'name-index',
      KeyConditionExpression: '#name = :name and startAtMonth = :startAtMonth',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': name,
        ':startAtMonth': month.toMillis()
      }
    };
    const response = await DynamoDBClient.query(param).promise();
    const items = response.Items!;
    return items.map(DynamodbAttendanceManagementTable.convertAttendanceDataToModel);

  }

  private static convertAttendanceDataToModel(item: DocumentClient.AttributeMap): Attendance {
    return {
      attendanceId: item.attendanceId,
      userId: item.userId,
      name: item.name,
      displayName: item.displayName,
      image48: item.image48,
      startAt: DateTime.fromMillis(Number(item.startAt)),
      endAt: DateTime.fromMillis(Number(item.endAt)),
      startAtDay: DateTime.fromMillis(Number(item.startAtDay)),
      startAtMonth: DateTime.fromMillis(Number(item.startAtMonth)),
    }
  }

}
