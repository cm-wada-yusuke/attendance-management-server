import axios from 'axios';
import * as qs from 'qs';
import { UserProfile } from '../../domains/attendance/reaction-attendance-use-case';

const OAuthAccessToken = process.env.OAUTH_ACCESS_TOKEN!;
// const BotAccessToken = process.env.BOT_ACCESS_TOKEN!;

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

  // static async getReactions(thread: ThreadInfo): Promise<void> {
  //     const param: ConversationsReactionParameter = {
  //         channel: thread.channel,
  //         timestamp: thread.ts,
  //         full: true,
  //     };
  //     const query = qs.stringify(param);
  //     const url = `https://slack.com/api/reactions.get?${query}`;
  //     console.log(url);
  //     try {
  //         const response = await axios.get(url, {
  //             headers: {
  //                 'Content-Type': 'application/json;utf-8',
  //                 'Authorization': `Bearer ${OAuthAccessToken}`
  //             }
  //         });
  //         console.log(response.data);
  //         console.log(response.data.message.reactions);
  //     } catch (e) {
  //         console.log(e);
  //         throw e;
  //     }
  //
  //
  // }

  // static async postEphemeralMessage(ephemeralMessage: EphemeralMessage): Promise<void> {
  //   console.log(ephemeralMessage);
  //   try {
  //     const response = await axios.post('https://slack.com/api/chat.postEphemeral', ephemeralMessage, {
  //       headers: {
  //         'Content-Type': 'application/json;utf-8',
  //         'Authorization': `Bearer ${BotAccessToken}`
  //       }
  //     });
  //     console.log(response);
  //   } catch (e) {
  //     console.log(e);
  //     throw e;
  //   }
  // }
}


// interface ConversationsRepliesParameter {
//     channel: string;
//     ts: string;
//     limit?: string;
// }
//
// interface ConversationsReactionParameter {
//     channel: string;
//     timestamp: string;
//     full: boolean;
// }

interface UsersInfoResponse {
  user: {
    id: string;
    name: string;
    profile: {
      image_24: string;
    }
  }
}
