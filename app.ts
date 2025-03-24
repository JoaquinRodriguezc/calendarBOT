import "dotenv/config";
import { GoogleCalendarService } from "./calendar";
import { IaService } from "./ia";
import { WhatsappService } from "./whatsapp";

const calendar = new GoogleCalendarService();

const iaService = new IaService(calendar);

const whatsapp = new WhatsappService(iaService);

// const prompt = "Please search an event with summary 'Testing IA' and delete it";
// console.log(await iaService.processChatStream(prompt));

// // const events = await calendar.getEventsInfo({
// //   maxDate: "2025-06-01",
// //   summaryFilter: "Editando horario",
// // });

// // await calendar.editEvent({
// //   ...events[0],
// //   summary: "Editando horario",
// //   day: "2025-04-01",
// // });
