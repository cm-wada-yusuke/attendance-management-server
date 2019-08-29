import 'source-map-support/register';
import * as Console from 'console';
import { SubscribeEvent } from '../slack-event';
import { ReactionAttendanceUseCase } from '../../domains/attendance/reaction-attendance-use-case';

export async function handler(event: KinesisRecords): Promise<void[]> {
  Console.log(event);

  const dispatchPromises = event.Records.map(record => {
    const payloadString = Buffer.from(record.kinesis.data, 'base64').toString('utf-8');
    const payload = JSON.parse(payloadString) as SubscribeEvent;
    return KinesisEventSubscribeController.forwardEvent(payload);
  });
  return Promise.all(dispatchPromises);
}

class KinesisEventSubscribeController {
  public static forwardEvent(payload: SubscribeEvent): Promise<void> {
    Console.log(payload);
    return ReactionAttendanceUseCase.reaction({
      eventTs: payload.event.event_ts,
      itemUser: payload.event.item_user,
      user: payload.event.user,
      reaction: payload.event.reaction,
      type: payload.event.type,
      item: payload.event.item
    });
  }
}


interface KinesisRecords {
  Records: {
    kinesis: {
      data: string;
    }
  }[];
}
