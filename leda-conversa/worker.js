// Leda: o cérebro roda neste Web Worker, no próprio aparelho (WebGPU).
import { WebWorkerMLCEngineHandler } from "./vendor/web-llm-0.2.86.js";

const handler = new WebWorkerMLCEngineHandler();
self.onmessage = (msg) => handler.onmessage(msg);
