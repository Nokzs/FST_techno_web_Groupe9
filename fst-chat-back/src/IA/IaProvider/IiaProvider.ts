export interface IIaProvider {
  embed(text: string): Promise<number[] | null>;
  ask(question: string, channelId: string, userId: string): Promise<string>;
}
