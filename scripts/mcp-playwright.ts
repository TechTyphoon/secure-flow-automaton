#!/usr/bin/env ts-node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { chromium, Browser, Page, ConsoleMessage } from "playwright";

let browser: Browser | null = null;
let page: Page | null = null;
let logs: string[] = [];

async function ensureBrowser() {
  if (!browser) {
    browser = await chromium.launch({ headless: true });
  }
  if (!page) {
    const ctx = await browser.newContext();
    page = await ctx.newPage();
    page.on("console", (m: ConsoleMessage) => logs.push(`${m.type()}: ${m.text()}`));
  }
}

const server = new Server({
  name: "mcp-playwright",
  version: "0.1.0",
}, {
  capabilities: { tools: {} },
});

server.tool("open", {
  description: "Open a URL in a headless browser",
  inputSchema: z.object({ url: z.string() })
}, async ({ url }) => {
  await ensureBrowser();
  logs = [];
  await page!.goto(url, { waitUntil: "domcontentloaded" });
  return { content: [{ type: "text", text: `opened ${url}` }] };
});

server.tool("html", {
  description: "Get current page HTML",
  inputSchema: z.object({})
}, async () => {
  await ensureBrowser();
  const html = await page!.content();
  return { content: [{ type: "text", text: html.slice(0, 50000) }] };
});

server.tool("console", {
  description: "Get collected console logs",
  inputSchema: z.object({ limit: z.number().optional() })
}, async ({ limit }) => {
  const slice = typeof limit === "number" ? logs.slice(-limit) : logs;
  return { content: [{ type: "text", text: slice.join("\n") || "" }] };
});

server.tool("screenshot", {
  description: "Take a PNG screenshot of the current page",
  inputSchema: z.object({ fullPage: z.boolean().optional() })
}, async ({ fullPage }) => {
  await ensureBrowser();
  const buf = await page!.screenshot({ fullPage: !!fullPage, type: "png" });
  const b64 = buf.toString("base64");
  return { content: [{ type: "image", data: b64, mimeType: "image/png" }] };
});

server.onShutdown(async () => {
  if (browser) await browser.close();
});

const transport = new StdioServerTransport();
await server.connect(transport);
