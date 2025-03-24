import { openai } from "@ai-sdk/openai";
import { CoreMessage, generateText } from "ai";
import { CalendarTools } from "./tools";
import { GoogleCalendarService } from "./calendar";
import { collectTools } from "./utils";

export class IaService {
  constructor(private calendar: GoogleCalendarService) {}

  async processChatStream(prompt: string) {
    try {
      const systemPrompt =
        "You are a calendar assistant. You will be asked to get,edit,add or delete events. When adding or editing en event, the format of time must be: HH:mm:ss ALWAYS.After doing an successful operation, please confirm telling it to the user";

      const currentConversation: CoreMessage[] = [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: prompt,
        },
      ];

      const tools = new CalendarTools(this.calendar);
      const collectedTools = collectTools(tools);

      const response = await generateText({
        model: openai("gpt-4o"),
        temperature: 0,
        tools: collectedTools,
        messages: currentConversation,
        maxSteps: 5,
      });

      return response.text;
    } catch (error: any) {
      throw new Error(`Failed to process IA message: ${error.message}`);
    }
  }
}
