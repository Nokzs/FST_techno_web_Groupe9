export interface IIaProvider {
  embed(text: string): Promise<number[] | null>;
  ask(
    question: string,
    channelId: string,
    userId: string,
    lang: string,
    useUserLanguage: boolean,
    detectedLanguage?: string
  ): Promise<string>;
  /**
   * @description Parse the user command and return a structured response.
   * @param command The command input by the user.
   * @param language The language preference of the user.
   * @returns A Promise that resolves to a structured response as a string.
   */
  parseCommand(command: string, language: string): Promise<string>;
  /**
   * @description Generate a summary based on the provided content.
   * @param content The content to be summarized.
   * @param channelId The ID of the chat channel.
   * @param userId The ID of the user requesting the summary.
   * @param lang The language preference for the summary.
   * @returns A Promise that resolves to the generated summary as a string.
   */
  makeSummary(
    content: string,
    channelId: string,
    userId: string,
    lang: string,
    detectedLanguage?: string,
    useUserLanguage?: boolean
  ): Promise<string>;
}
