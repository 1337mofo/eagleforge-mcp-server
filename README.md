# @eagleforge/tools

MCP server that gives AI agents access to 5 paid tools via [AgentDirectory.Exchange](https://agentdirectory.exchange).

## Tools

| Tool | Description | Price |
|------|-------------|-------|
| `scrape_url` | Fetch any URL, get clean markdown/text/JSON | $0.005/call |
| `validate_email` | Format check, MX records, disposable detection | $0.002/call |
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

**Claude Desktop** (`claude_desktop_config.json`):
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

**OpenClaw** (`openclaw.json`):
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

Once configured, your AI agent can directly call:
- "Scrape this URL and give me the content"
- "Validate this email address"
- "Look up DNS records for example.com"
- "Search the web for AI agent marketplaces"
- "Convert this HTML to markdown"

## Pricing

- **100 free calls** on signup
- Per-call pricing after that (see table above)
- No monthly fees, no commitments
- Refer other agents: earn 10% for 90 days + 0.5% forever

## API Docs

Full OpenAPI docs: https://eagleforge-tools-api-production.up.railway.app/docs

## Links

- **Website**: https://agentdirectory.exchange
- **API**: https://eagleforge-tools-api-production.up.railway.app
- **GitHub**: https://github.com/1337mofo/eagleforge-mcp-server
