import {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  proto,
} from "baileys";
import { IaService } from "./ia";

export class WhatsappService {
  private socket;
  private messageStore: any = {};
  private emptyChar: string = "‎ ";
  private authFolder: string;
  private selfReply: boolean;
  private saveCredentials!: () => Promise<void>;
  constructor(private iaService: IaService) {
    this.authFolder = "auth";
    this.selfReply = false;
    this.restart();
  }

  public async connect(): Promise<void> {
    const { state, saveCreds } = await useMultiFileAuthState(this.authFolder);
    this.saveCredentials = saveCreds;

    this.socket = makeWASocket({
      printQRInTerminal: true,
      auth: state,
    });
  }

  public async run(): Promise<void> {
    this.socket.ev.process(async (events) => {
      if (events["connection.update"]) {
        const update = events["connection.update"];
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
          if (
            lastDisconnect?.error?.output?.statusCode ===
            DisconnectReason.loggedOut
          ) {
            console.log("Connection closed. You are logged out.");
          } else if (
            lastDisconnect?.error?.output?.statusCode ===
            DisconnectReason.timedOut
          ) {
            console.log(
              new Date().toLocaleTimeString(),
              "Timed out. Will retry in 1 minute."
            );
            setTimeout(this.restart.bind(this), 60 * 1000);
          } else {
            this.restart();
          }
        }
      }

      if (events["creds.update"]) {
        await this.saveCredentials();
      }

      if (events["messages.upsert"]) {
        const { messages }: { messages: Message[] } = events["messages.upsert"];

        for (const msg of messages) {
          const { key, message } = msg;
          console.log(`Handling message for ${key}: ${message}`);

          let text = this.getText(key, message);

          if (text?.includes("Bot") && key.fromMe) {
            const res = await this.iaService.processChatStream(text);
            await this.sendMessage(key.remoteJid, { text: res });
          }
        }
      }
    });
  }

  private async restart(): Promise<void> {
    await this.connect();
    await this.run();
  }

  private getText(key: proto.IMessageKey, message: proto.IMessage): string {
    try {
      let text =
        message.conversation || message.extendedTextMessage?.text || "";

      if (key.participant) {
        const me = key.participant.slice(0, 12);
        text = text.replace(/\@me\b/g, `@${me}`);
      }
      console.log(text);
      return text;
    } catch (err) {
      return "";
    }
  }

  private async sendMessage(
    jid: string,
    content: any,
    ...args: any[]
  ): Promise<void> {
    try {
      if (!this.selfReply) content.text = (content.text || "") + this.emptyChar;
      const sent = await this.socket.sendMessage(jid, content, ...args);
      this.messageStore[sent.key.id!] = sent;
    } catch (err) {
      console.log("Error sending message", err);
    }
  }
}

type Message = {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
    participant: string;
  };
  messageTimestamp: number;
  pushName: string;
  broadcast: boolean;
  message: any;
};
