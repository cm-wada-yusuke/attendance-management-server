import { ApiClientSlack } from '../../infrastructures/slack/api-client-slack';
import * as Console from 'console';
import { DynamodbWhiteChannelTable } from '../../infrastructures/dynamo/dynamodb-white-channel-table';

export class ReactionAttendanceUseCase {

  /**
   * リアクションイベントからユーザー情報を取得し、リプライとして投稿します。
   * @param sub リアクションイベント情報
   */
  public static async reaction(sub: ReactionContent): Promise<void> {
    // ユーザー情報収集
    const userProfile = await ApiClientSlack.getUser(sub.user);
    Console.log(userProfile);

    // コンテキストを投稿
    await ApiClientSlack.postReactionDetail(sub, userProfile);

  }

  public static async filterEvents(events: EventInfo[]): Promise<EventInfo[]> {

    // ホワイトリストに登録されていること
    const whiteChannelList: Channel[] = await DynamodbWhiteChannelTable.scan();
    Console.log('whiteList', whiteChannelList);
    const whiteEvents = events.filter(e => whiteChannelList.map(c => c.channel).includes(e.channel));

    // SlackBotに対するリアクションであること
    return whiteEvents.filter(e => e.itemUser === 'USLACKBOT');
  }

}


export interface ReactionContent {
  type: string;
  user: string;
  reaction: string;
  itemUser: string;
  item: {
    type: string,
    channel: string,
    ts: string
  };
  eventTs: string
}


export interface UserProfile {
  id: string;
  name: string;
  realName: string;
  displayName: string;
  tz: string;
  tzLabel: string;
  image24: string;
  image32: string;
  image48: string;
  statusEmoji: string;
  statusText: string;
}


export interface EventInfo {
  itemUser: string;
  channel: string;
}

export interface Channel {
  channel: string;
}
