import 'source-map-support/register';
import * as Console from 'console';
import { SubscribeEvent } from '../slack-event';
import * as Kinesis from 'aws-sdk/clients/kinesis';
import { PutRecordInput } from 'aws-sdk/clients/kinesis';

const Region = process.env.REGION!;
const SlackEventSubscribeStream = process.env.SLACK_EVENT_SUBSCRIBE_STREAM!;

const KinesisClinet = new Kinesis({
  region: Region,
  apiVersion: '2013-12-02'
});

export async function handler(event: SubscribeEvent): Promise<any> {
  Console.log(event);
  if ('challenge' in event) {
    return Promise.resolve({
      challenge: (event as any).challenge
    })
  }
  const putRecord: PutRecordInput = {
    PartitionKey: event.event.item_user,
    StreamName: SlackEventSubscribeStream,
    Data: JSON.stringify(event),
  };
  Console.log(putRecord);
  await KinesisClinet.putRecord(putRecord).promise();
}

