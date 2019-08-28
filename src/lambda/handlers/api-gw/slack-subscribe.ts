import 'source-map-support/register';
import * as Console from 'console';

export async function handler(event: Subscribe): Promise<void> {
  Console.log(event);
}

interface Subscribe {
  type: string,
  user: string,
  reaction: string,
  item_user: string,
  item: {
    type: string,
    channel: string,
    ts: string
  },
  event_ts: string
}

