import axios from 'axios';
import * as qs from 'qs';
import { ReactionContent, UserProfile } from '../../domains/attendance/reaction-attendance-use-case';

const OAuthAccessToken = process.env.OAUTH_ACCESS_TOKEN!;
const BotAccessToken = process.env.BOT_ACCESS_TOKEN!;

export class ApiClientSlack {

  static async getUser(userId: string): Promise<UserProfile> {
    const param = {
      user: userId,
      token: OAuthAccessToken,
    };
    const query = qs.stringify(param);
    const url = `https://slack.com/api/users.info?${query}`;
    console.log(url);
    try {
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json;utf-8',
        }
      });
      console.log(response);
      const user: UsersInfoResponse = response.data as UsersInfoResponse;

      return {
        id: user.user.id,
        name: user.user.name,
        image24: user.user.profile.image_24
      }
    } catch (e) {
      console.log(e);
      throw e;
    }
  }


  public static async postReactionDetail(reaction: ReactionContent, profile: UserProfile): Promise<void> {
    const request: PostMessageRequest = {
      token:BotAccessToken,
      channel: reaction.item.channel,
      as_user: false,
      thread_ts: reaction.item.ts,
      username: 'Attendancer',
      blocks: ApiClientSlack.createBlockString(reaction, profile)
    };

    try {
      const response = await axios.post('https://slack.com/api/chat.postMessage', request, {
        headers: {
          'Content-Type': 'application/json;utf-8',
          'Authorization': `Bearer ${BotAccessToken}`
        }
      });
      console.log(response);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  private static createBlockString(reaction: ReactionContent, profile: UserProfile): string{
    return JSON.stringify([
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `:${reaction.reaction}:`
        }
      },
      {
        "type": "context",
        "elements": [
          {
            "type": "image",
            "image_url": profile.image24,
            "alt_text": profile.name,
          },
          {
            "type": "mrkdwn",
            "text": `${profile.name} <!date^${parseInt(reaction.eventTs)}^Reacted {date_num} {time_secs}|Reacted 2014-02-18 6:39:42 AM>`
          }
        ]
      },
      {
        "type": "divider"
      }
    ]);
  }
}


interface UsersInfoResponse {
  user: {
    id: string;
    name: string;
    profile: {
      image_24: string;
    }
  }
}

interface PostMessageRequest {
  token: string;
  channel: string;
  as_user: boolean;
  blocks: string;
  thread_ts: string;
  username: string;
}
