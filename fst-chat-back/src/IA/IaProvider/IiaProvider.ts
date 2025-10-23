export interface IIaProvider {
  embed(text: string): Promise<number[] | null>;
  //ask(question: string, context?: string): Promise<string>;
}
