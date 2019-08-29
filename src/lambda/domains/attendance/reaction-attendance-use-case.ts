import { ApiClientSlack } from '../../infrastructures/slack/api-client-slack';
import * as Console from 'console';

export class ReactionAttendanceUseCase {
  public static async reaction(sub: ReactionContent): Promise<void> {
    // ユーザー情報収集
    const userProfile = await ApiClientSlack.getUser(sub.user);
    Console.log(userProfile);


    // コンテキストを投稿

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
  image24: string;
}
