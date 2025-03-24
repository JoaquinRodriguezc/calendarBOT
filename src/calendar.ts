import { calendar_v3, google } from "googleapis";
export class GoogleCalendarService {
  private calendar: calendar_v3.Calendar;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        private_key: process.env.GOOGLE_PRIVATE_KEY,
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
      },
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    this.calendar = google.calendar({
      version: "v3",
      auth: auth,
    });
  }

  public async addEvent(event: EventAdd) {
    return await this.calendar.events.insert({
      calendarId: process.env.CALENDAR_ID,
      requestBody: {
        summary: event.summary,
        start: {
          dateTime: this.getIsoTime(event.day, event.startTime),
        },
        end: {
          dateTime: this.getIsoTime(event.day, event.endTime),
        },
        description: event.description,
      },
    });
  }
  public async getEvent(eventId: string) {
    const res = await this.calendar.events.get({
      calendarId: process.env.CALENDAR_ID,
      eventId,
    });
    return this.getEventInfo(res.data);
  }
  public async editEvent(editedEvent: EventEdit) {
    const event = await this.getEvent(editedEvent.id);
    if (!event) return null;

    const start = this.getIsoTime(
      editedEvent.day ?? event.day,
      editedEvent.startTime ?? event.startTime
    );
    const end = this.getIsoTime(
      editedEvent.day ?? event.day,
      editedEvent.endTime ?? event.endTime
    );
    const newEvent = {
      summary: editedEvent.summary,
      day: editedEvent.day,
      start: { dateTime: start },
      end: { dateTime: end },
      description: editedEvent.description,
    };
    const edited = await this.calendar.events.patch({
      calendarId: process.env.CALENDAR_ID,
      eventId: event.id,
      requestBody: newEvent,
    });
    return this.getEventInfo(edited.data);
  }

  public async deleteEvent(eventId: string) {
    void this.calendar.events.delete({
      calendarId: process.env.CALENDAR_ID,
      eventId,
    });
  }

  public async getEventsInfo(options: GetEvents): Promise<EventInfo[]> {
    let events = await this.getEvents(options);

    if (!events) return [];

    if (options.summaryFilter) {
      events = events.filter(
        (e) => e.summary && e.summary.includes(options.summaryFilter!)
      );
    }

    return events.map((event) => this.getEventInfo(event)).filter((e) => !!e);
  }
  private async getEvents(options: GetEvents) {
    const res = await this.calendar.events.list({
      calendarId: process.env.CALENDAR_ID,
      timeMin: new Date().toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: options.maxResults,
      timeMax: options.maxDate
        ? `${options.maxDate}T23:59:59-03:00`
        : undefined,
    });
    const events = res.data?.items;
    return events;
  }
  private getEventInfo(event: calendar_v3.Schema$Event): EventInfo | null {
    const startTime = event.start?.dateTime;
    const endTime = event.end?.dateTime;

    if (!startTime || !endTime || !event.id) return null;
    return {
      id: event.id,
      summary: event.summary!,
      day: this.getDay(startTime),
      startTime: this.getTime(startTime),
      endTime: this.getTime(endTime),
      description: event.description,
    };
  }
  private getTime(dateTime: string) {
    return dateTime.split("T")[1].split("-")[0];
  }
  private getDay(dateTime: string) {
    return dateTime.split("T")[0];
  }
  private getIsoTime(day: string, time: string) {
    return `${day}T${time}-03:00`;
  }
}

type GetEvents = {
  maxResults?: number;
  maxDate?: string;
  summaryFilter?: string;
};

type EventInfo = {
  id: string;
  summary: string;
  // YYYY-MM-DD
  day: string;
  // HH-MM-SS
  startTime: string;
  endTime: string;
  description?: string | null;
};

type EventEdit = Partial<EventInfo> & { id: string };
type EventAdd = Omit<EventInfo, "id">;
