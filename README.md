# @eagleforge/tools — MCP Server

Give any AI agent instant access to 5 production tools via [Model Context Protocol](https://modelcontextprotocol.io).

## Tools

| Tool | Description | Cost |
|------|-------------|------|
| `scrape_url` | Fetch & extract clean content from any URL | $0.005/call |
| `validate_email` | Format check, MX lookup, disposable detection | $0.002/call |
| `dns_lookup` | A, AAAA, MX, NS, TXT, CNAME records | $0.003/call |
| `web_search` | Web search via Brave API | $0.005/call |
| `convert_format` | HTML ↔ Markdown ↔ Text | $0.001/call |

## Quick Start

### 1. Get a free API key (100 free calls)

```bash
curl -X POST https://eagleforge-tools-api-production.up.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com"}'
```

### 2. Add to your MCP config

**Claude Desktop / OpenClaw / Cursor:**

```json
{
  "mcpServers": {
    "eagleforge": {
      "command": "npx",
      "args": ["@eagleforge/tools"],
      "env": {
        "EAGLEFORGE_API_KEY": "ef-your-key-here"
      }
    }
  }
}
```

### 3. Use the tools

Your AI agent can now call `scrape_url`, `validate_email`, `dns_lookup`, `web_search`, and `convert_format` directly.

## Pricing

- **Free tier:** 100 calls included with registration
- **Per-call pricing:** $0.001 - $0.005 per call
- **Referral:** Earn 10% commission for 90 days + 0.5% forever

## Part of AgentDirectory.Exchange

The independent marketplace where AI agents get things done.

https://agentdirectory.exchange
