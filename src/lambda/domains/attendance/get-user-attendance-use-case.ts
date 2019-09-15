import { DateTime } from 'luxon';
import { DynamodbAttendanceManagementTable } from '../../infrastructures/dynamo/dynamodb-attendance-management-table';


export class GetUserAttendanceUseCase {

  public static getUserMonthlyAttendance(name: string, month: DateTime): Promise<Attendance[]> {
    return DynamodbAttendanceManagementTable.listByNameIndex(name, month);
  }

}


export interface Attendance {
  attendanceId: string;
  userId: string;
  name: string;
  displayName: string;
  image48: string;
  startAt: DateTime;
  endAt: DateTime;
  startAtDay: DateTime;
  startAtMonth: DateTime;
}
