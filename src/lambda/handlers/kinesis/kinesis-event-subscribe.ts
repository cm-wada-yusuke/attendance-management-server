import 'source-map-support/register';
import * as Console from 'console';
import { SubscribeEvent } from '../slack-event';
import { EventInfo, ReactionAttendanceUseCase } from '../../domains/attendance/reaction-attendance-use-case';

export async function handler(event: KinesisRecords): Promise<void[]> {
  Console.log(event);

  const subscribeEvents: SubscribeEvent[] = event.Records.map(record => {
    Console.log('record.kinesis', record.kinesis);
    Console.log('record.kinesis.data', record.kinesis.data);
    const payloadString = Buffer.from(record.kinesis.data, 'base64').toString('utf-8');
    Console.log('decoded', payloadString);
    return JSON.parse(payloadString) as SubscribeEvent;
  });
  Console.log('origin', subscribeEvents);

  const filtered = await KinesisEventSubscribeController.filterEvents(subscribeEvents);
  Console.log('filtered', filtered);


  const promisedPost = filtered.map(KinesisEventSubscribeController.forwardEvent);
  return Promise.all(promisedPost);
}

class KinesisEventSubscribeController {

  public static async filterEvents(events: SubscribeEvent[]): Promise<SubscribeEvent[]> {
    try {
      const eventInfos: EventInfo[] = events.map(e => ({
        itemUser: e.event.item_user,
        channel: e.event.item.channel
      }));
      const filteredInfos = await ReactionAttendanceUseCase.filterEvents(eventInfos);

      return events.filter(e => filteredInfos.map(i => i.channel).includes(e.event.item.channel));
    } catch (e) {
      Console.log('filterEvents failed. Reason: ', e);
      return [];
    }
  }

  public static async forwardEvent(payload: SubscribeEvent): Promise<void> {
    Console.log(payload);
    try {
      await ReactionAttendanceUseCase.reaction({
        eventTs: payload.event.event_ts,
        itemUser: payload.event.item_user,
        user: payload.event.user,
        reaction: payload.event.reaction,
        type: payload.event.type,
        item: payload.event.item
      });
    } catch (e) {
      Console.log('forwardEvent failed. Reason: ', e);
    }
  }
}


interface KinesisRecords {
  Records: Record[];
}

interface Record {
  kinesis: {
    data: string;
  }
}
