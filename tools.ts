import { tool } from "ai";
import { z } from "zod";
import { GoogleCalendarService } from "./calendar";

export class CalendarTools {
  constructor(private calendarService: GoogleCalendarService) {}

  public getEventsTool = tool({
    description: "Get events filtered optionally by summary and date range",
    parameters: z.object({
      maxResults: z
        .number()
        .optional()
        .describe("Maximum number of events to retrieve"),
      maxDate: z
        .string()
        .optional()
        .describe("Upper date limit in YYYY-MM-DD format"),
      summaryFilter: z
        .string()
        .optional()
        .describe("Keyword to filter event summaries"),
    }),
    execute: async (options) => {
      const events = await this.calendarService.getEventsInfo(options);
      return {
        events,
      };
    },
  });
  addEventTool = tool({
    description: "Add a new event to the calendar",
    parameters: z.object({
      id: z
        .string()
        .optional()
        .describe("Unique event ID (base32hex, 5-1024 chars)"),
      summary: z.string().describe("Short description of the event"),
      day: z.string().describe("Date of the event in YYYY-MM-DD format"),
      startTime: z.string().describe("Start time in HH:mm format"),
      endTime: z.string().describe("End time in HH:mm format"),
      description: z
        .string()
        .optional()
        .nullable()
        .describe("Optional longer description"),
    }),
    execute: async (event) => {
      const added = await this.calendarService.addEvent(event);
      return {
        eventId: added.data?.id ?? "unknown",
        success: true,
      };
    },
  });

  editEventTool = tool({
    description: "Edit an existing calendar event",
    parameters: z.object({
      id: z.string().describe("ID of the event to edit"),
      summary: z.string().optional().describe("New summary of the event"),
      day: z.string().optional().describe("Event date in YYYY-MM-DD"),
      startTime: z
        .string()
        .optional()
        .describe("New start time in HH:mm:ss format"),
      endTime: z
        .string()
        .optional()
        .describe("New end time in HH:mm:ss format"),
      description: z
        .string()
        .optional()
        .describe("New description of the event"),
    }),
    execute: async (event) => {
      const updated = await this.calendarService.editEvent(event);
      return {
        updatedEvent: updated,
        success: true,
      };
    },
  });

  deleteEventTool = tool({
    description: "Delete a calendar event by ID",
    parameters: z.object({
      eventId: z.string().describe("ID of the event to delete"),
    }),
    execute: async ({ eventId }) => {
      await this.calendarService.deleteEvent(eventId);
      return {
        deleted: true,
        eventId,
      };
    },
  });
}
