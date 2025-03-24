import "dotenv/config";
import { GoogleCalendarService } from "./calendar";
import { IaService } from "./ia";
import { WhatsappService } from "./whatsapp";

const calendar = new GoogleCalendarService();

const iaService = new IaService(calendar);

const whatsapp = new WhatsappService(iaService);
