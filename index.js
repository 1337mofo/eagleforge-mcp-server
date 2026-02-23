#!/usr/bin/env node
/**
 * EagleForge Tools MCP Server
 * Gives any MCP-compatible AI agent access to 5 paid tools:
 * - Web scraping, email validation, DNS lookup, search, format conversion
 * 
 * Usage: npx @eagleforge/tools
 * Get API key: POST https://eagleforge-tools-api-production.up.railway.app/auth/register
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const API_BASE = process.env.EAGLEFORGE_API_URL || "https://eagleforge-tools-api-production.up.railway.app";
const API_KEY = process.env.EAGLEFORGE_API_KEY || "eagle-demo-key-2026";

async function callTool(endpoint, body) {
  const resp = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
    },
    body: JSON.stringify(body),
  });
  return resp.json();
}

const TOOLS = [
  {
    name: "scrape_url",
    description: "Fetch a URL and extract clean content as markdown, text, or JSON. Strips scripts/nav/headers. $0.005/call.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "URL to scrape" },
        format: { type: "string", enum: ["markdown", "text", "json"], default: "markdown", description: "Output format" },
        max_chars: { type: "number", default: 50000, description: "Max characters to return" },
      },
      required: ["url"],
    },
  },
  {
    name: "validate_email",
    description: "Validate an email address: format check, MX record lookup, disposable domain detection. $0.002/call.",
    inputSchema: {
      type: "object",
      properties: {
        email: { type: "string", description: "Email address to validate" },
      },
      required: ["email"],
    },
  },
  {
    name: "dns_lookup",
    description: "Full DNS record lookup: A, AAAA, MX, NS, TXT, CNAME records for any domain. $0.003/call.",
    inputSchema: {
      type: "object",
      properties: {
        domain: { type: "string", description: "Domain to look up" },
      },
      required: ["domain"],
    },
  },
  {
    name: "web_search",
    description: "Search the web via Brave Search API. Returns titles, URLs, and snippets. $0.005/call.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        count: { type: "number", default: 5, description: "Number of results (1-10)" },
      },
      required: ["query"],
    },
  },
  {
    name: "convert_format",
    description: "Convert between HTML, Markdown, and plain text. Bidirectional. $0.001/call.",
    inputSchema: {
      type: "object",
      properties: {
        content: { type: "string", description: "Content to convert" },
        from_format: { type: "string", enum: ["html", "markdown", "text"], description: "Source format" },
        to_format: { type: "string", enum: ["html", "markdown", "text"], description: "Target format" },
      },
      required: ["content", "from_format", "to_format"],
    },
  },
];

const TOOL_ENDPOINTS = {
  scrape_url: "/tools/scrape",
  validate_email: "/tools/email-validate",
  dns_lookup: "/tools/dns-lookup",
  web_search: "/tools/search",
  convert_format: "/tools/convert",
};

const server = new Server(
  { name: "eagleforge-tools", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const endpoint = TOOL_ENDPOINTS[name];

  if (!endpoint) {
    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
  }

  try {
    const result = await callTool(endpoint, args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
