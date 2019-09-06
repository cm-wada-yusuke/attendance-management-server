import 'source-map-support/register';
import * as Console from 'console';

export async function handler(event: Challenge): Promise<ChallengeResponse> {
  Console.log(event);
  return Promise.resolve({
    challenge: event.challenge
  });
}

interface Challenge {
  token: string;
  challenge: string;
  type: string;
}

interface ChallengeResponse {
  challenge: string;
}
