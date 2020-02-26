import axios from 'axios';
import * as qs from 'qs';
import { ReactionContent, UserProfile } from '../../domains/attendance/reaction-attendance-use-case';
import * as Console from 'console';

const OAuthAccessToken = process.env.OAUTH_ACCESS_TOKEN!;
const BotAccessToken = process.env.BOT_ACCESS_TOKEN!;

export class ApiClientSlack {

  /**
   * ユーザープロファイルを取得し、UserProfile として返します。
   * @param userId Slack ユーザーID
   */
  static async getUser(userId: string): Promise<UserProfile> {
    const param = {
      user: userId,
      token: OAuthAccessToken,
    };
    const query = qs.stringify(param);
    const url = `https://slack.com/api/users.info?${query}`;
    Console.log(url);
    try {
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json;utf-8',
        }
      });
      Console.log(response);
      const user: UsersInfoResponse = response.data as UsersInfoResponse;

      return {
        id: user.user.id,
        name: user.user.name,
        realName: user.user.real_name,
        displayName: user.user.profile.display_name,
        tz: user.user.tz,
        tzLabel: user.user.tz_label,
        // プロファイル画像を設定することにしたのでユーザープロファイルに含まれる `image_24` も取得します。
        image24: user.user.profile.image_24,
        image32: user.user.profile.image_32,
        image48: user.user.profile.image_48,
        statusEmoji: user.user.profile.status_emoji,
        statusText: user.user.profile.status_text
      }
    } catch (e) {
      Console.log(e);
      throw e;
    }
  }


  /**
   * リアクション内容をリプライとしてスレッドに投稿します。
   * @param reaction リアクションイベント情報
   * @param profile ユーザープロファイル
   */
  public static async postReactionDetail(reaction: ReactionContent, profile: UserProfile): Promise<void> {
    const request: PostMessageRequest = {
      token: BotAccessToken,
      channel: reaction.item.channel,
      as_user: false,
      icon_url: profile.image48,
      thread_ts: reaction.item.ts, // thread_ts を指定すると特定のスレッドに対するリプライになります。
      username: `Attendancer - ${profile.displayName ? profile.displayName : profile.name}`,
      blocks: ApiClientSlack.createBlockString(reaction, profile)
    };

    try {
      const response = await axios.post('https://slack.com/api/chat.postMessage', request, {
        headers: {
          'Content-Type': 'application/json;utf-8',
          'Authorization': `Bearer ${BotAccessToken}`
        }
      });
      Console.log(response);
    } catch (e) {
      Console.log(e);
      throw e;
    }
  }

  /**
   * リプライメッセージを構築します。Slack Message Builder で準備した形式を参考にします。
   * @param reaction リアクションイベント情報
   * @param profile ユーザープロファイル
   */
  private static createBlockString(reaction: ReactionContent, profile: UserProfile): string {
    const statusEmoji = `${profile.statusEmoji ? profile.statusEmoji : ''}`;
    const timestampBlock = `<!date^${parseInt(reaction.eventTs)}^Reacted {date_num} {time_secs}|Reacted 2014-02-18 6:39:42 AM>`;

    return JSON.stringify([
      {
        'type': 'section',
        'text': {
          'type': 'mrkdwn',
          'text': `:${reaction.reaction}:`
        }
      },
      {
        'type': 'context',
        'elements': [
          {
            'type': 'mrkdwn',
            // 時刻は、Slack のクライアントのタイムゾーンに合わせるためSlack指定の形式を利用しています。
            'text': `${statusEmoji} ${timestampBlock}`
          }
        ]
      },
    ]);
  }

  /**
   * 警告をスレッドに投稿します。
   */
  public static async postAlert(reaction: ReactionContent, profile: UserProfile): Promise<void> {
    const request: PostMessageRequest = {
      token: BotAccessToken,
      channel: reaction.item.channel,
      as_user: false,
      icon_url: profile.image48,
      thread_ts: reaction.item.ts, // thread_ts を指定すると特定のスレッドに対するリプライになります。
      username: `Attendancer - ${profile.displayName ? profile.displayName : profile.name}`,
      blocks: ApiClientSlack.createAlertBlock(reaction, profile)
    };

    try {
      const response = await axios.post('https://slack.com/api/chat.postMessage', request, {
        headers: {
          'Content-Type': 'application/json;utf-8',
          'Authorization': `Bearer ${BotAccessToken}`
        }
      });
      Console.log(response);
    } catch (e) {
      Console.log(e);
      throw e;
    }
  }

  private static createAlertBlock(reaction: ReactionContent, profile: UserProfile): string {
    const timestampBlock = `<!date^${parseInt(reaction.eventTs)}^Reacted {date_num} {time_secs}|Reacted 2014-02-18 6:39:42 AM>`;

    return JSON.stringify([
      {
        'type': 'section',
        'text': {
          'type': 'mrkdwn',
          'text': `@${profile.name} 日付を超えての :${reaction.reaction}: は原則禁止です。理由を添えて書き込んでください。`
        }
      },
      {
        'type': 'context',
        'elements': [
          {
            'type': 'mrkdwn',
            // 時刻は、Slack のクライアントのタイムゾーンに合わせるためSlack指定の形式を利用しています。
            'text': timestampBlock
          }
        ]
      },
    ]);
  }


}


interface UsersInfoResponse {
  user: {
    id: string;
    name: string;
    real_name: string;
    tz: string;
    tz_label: string;
    profile: {
      display_name: string;
      status_emoji: string;
      status_text: string;
      image_24: string;
      image_32: string;
      image_48: string;
    }
  }
}

interface PostMessageRequest {
  token: string;
  channel: string;
  as_user: boolean;
  icon_url: string;
  blocks: string;
  thread_ts: string;
  username: string;
}
