import { ZodObject } from "zod";
import { CalendarTools } from "./tools";

export function collectTools(instance: CalendarTools) {
  const tools: Record<string, Tools> = {};

  for (const key of Object.keys(instance)) {
    const value = instance[key];
    if (
      typeof value === "function" ||
      typeof value !== "object" ||
      !key.includes("Tool")
    )
      continue;
    tools[key] = value;
  }

  return tools;
}

type Tools = {
  description: string;
  execute: () => Promise<any>;
  parameters: ZodObject<any>;
};
