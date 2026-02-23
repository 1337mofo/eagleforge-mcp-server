#!/usr/bin/env node
/**
 * EagleForge Tools MCP Server
 * Connects AI agents to paid tools via Model Context Protocol
 * https://agentdirectory.exchange
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
  const res = await fetch(`${API_BASE}/tools/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

const server = new Server(
  { name: "eagleforge-tools", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "scrape_url",
      description: "Scrape a URL and return clean content as markdown, text, or JSON. Strips scripts/nav/headers. $0.005/call.",
      inputSchema: {
        type: "object",
        properties: {
          url: { type: "string", description: "URL to scrape" },
          format: { type: "string", enum: ["markdown", "text", "json"], default: "markdown", description: "Output format" },
          max_chars: { type: "number", default: 50000, description: "Maximum characters to return" },
        },
        required: ["url"],
      },
    },
    {
      name: "validate_email",
      description: "Validate an email address: format check, MX record verification, disposable domain detection. $0.002/call.",
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
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;
    switch (name) {
      case "scrape_url":
        result = await callTool("scrape", {
          url: args.url,
          format: args.format || "markdown",
          max_chars: args.max_chars || 50000,
        });
        break;
      case "validate_email":
        result = await callTool("email-validate", { email: args.email });
        break;
      case "dns_lookup":
        result = await callTool("dns-lookup", { domain: args.domain });
        break;
      case "web_search":
        result = await callTool("search", {
          query: args.query,
          count: args.count || 5,
        });
        break;
      case "convert_format":
        result = await callTool("convert", {
          content: args.content,
          from_format: args.from_format,
          to_format: args.to_format,
        });
        break;
      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }

    return {
      content: [{ type: "text", text: JSON.stringify(result.result || result, null, 2) }],
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
