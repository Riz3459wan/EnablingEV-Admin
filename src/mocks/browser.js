import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";
import { seedStore } from "./seed";

seedStore();

export const worker = setupWorker(...handlers);
