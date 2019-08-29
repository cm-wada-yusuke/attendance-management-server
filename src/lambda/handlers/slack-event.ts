export interface SubscribeEvent {
  event: {
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
}
