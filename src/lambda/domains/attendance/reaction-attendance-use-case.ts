import { ApiClientSlack } from '../../infrastructures/slack/api-client-slack';
import * as Console from 'console';
import { DynamodbWhiteChannelTable } from '../../infrastructures/dynamo/dynamodb-white-channel-table';
import { DateTime } from 'luxon';
import { DynamodbAttendanceManagementTable } from '../../infrastructures/dynamo/dynamodb-attendance-management-table';

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

    // リアクションデータを保存
    await ReactionAttendanceUseCase.storeReaction(sub, userProfile);

  }

  public static async filterEvents(events: EventInfo[]): Promise<EventInfo[]> {

    // ホワイトリストに登録されていること
    const whiteChannelList: string[] = await DynamodbWhiteChannelTable.scan();
    Console.log('whiteList', whiteChannelList);
    const whiteEvents = events.filter(e => whiteChannelList.includes(e.channel));

    // SlackBotに対するリアクションであること
    return whiteEvents.filter(e => e.itemUser === 'USLACKBOT');
  }

  /**
   * リアクションを保存します
   * @param reaction リアクションデータ
   * @param profile プロファイルデータ
   */
  private static async storeReaction(reaction: ReactionContent, profile: UserProfile): Promise<void> {

    // 開始か終了かそれ以外を判定
    const attendanceType = await ReactionAttendanceUseCase.checkReactionType(reaction.reaction, reaction.item.channel);
    Console.log('attendanceType', attendanceType);

    // リアクション時間のセットを作成
    const reactAtDateTime = DateTime.fromMillis(Number(reaction.eventTs) * 1000);
    const reactDateExtension: ReactDateExtension = {
      reactAt: reactAtDateTime,
      reactAtDay: reactAtDateTime.startOf('day'),
      reactAtMonth: reactAtDateTime.startOf('month'),
    };

    if (attendanceType === 'start') {
      await DynamodbAttendanceManagementTable.createStart(reaction, reactDateExtension, profile);
    } else if (attendanceType === 'end') {
      await DynamodbAttendanceManagementTable.updateEnd(reaction, reactDateExtension);
    } else {
      return;
    }


  }

  /**
   * 保存されたデータを利用して、開始または終了リアクションかどうかを判定します。
   * @param reactionString 判定対象
   * @param channelId チャンネルID
   */
  private static async checkReactionType(reactionString: string, channelId: string): Promise<AttendanceType> {
    const channel = await DynamodbWhiteChannelTable.get(channelId);
    const startList = channel.startReactionList;
    const endList = channel.endReactionList;

    Console.log('channel', channel);
    Console.log('reactionString', reactionString);
    Console.log('startList', startList);
    Console.log('endList', endList);

    if (startList.includes(reactionString)) {
      return 'start';
    } else if (endList.includes(reactionString)) {
      return 'end';
    } else {
      return 'other';
    }

  }


}

export type AttendanceType = 'start' | 'end' | 'other';


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

export interface ReactDateExtension {
  reactAt: DateTime;
  reactAtDay: DateTime;
  reactAtMonth: DateTime;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
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
  startReactionList: string[];
  endReactionList: string[];
}
