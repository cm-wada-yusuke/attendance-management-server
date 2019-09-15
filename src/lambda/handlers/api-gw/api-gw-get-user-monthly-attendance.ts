import 'source-map-support/register';
import { GetUserAttendanceUseCase } from '../../domains/attendance/get-user-attendance-use-case';
import { DateTime, Settings } from 'luxon';

Settings.defaultZoneName = 'Asia/Tokyo';

export async function handler(event: Name): Promise<AttendanceResponse[]> {
  const attendances = await GetUserAttendanceUseCase.getUserMonthlyAttendance(
    event.name,
    DateTime.fromFormat(event.month, 'yyyy-MM', {zone: 'UTC'})
  );
  return attendances.map(a => ({
    ...a,
    startAt: a.startAt.toISO(),
    endAt: a.endAt.toISO(),
    startAtDay: a.startAtDay.toISO(),
    startAtMonth: a.startAtMonth.toISO(),
  }));

}

interface Name {
  name: string;
  month: string;
}


interface AttendanceResponse {
  attendanceId: string;
  userId: string;
  name: string;
  displayName: string;
  image48: string;
  startAt: string;
  endAt: string;
  startAtDay: string;
  startAtMonth: string;
}
