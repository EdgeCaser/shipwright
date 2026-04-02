# Connecting Your Tools to Shipwright

Shipwright's agents work fine on their own, but they get a lot more useful when they can read and write to the tools your team already uses. Instead of pasting Jira tickets into chat or describing what your Amplitude dashboard says, the agents can just pull that data directly.

This is done through MCP (Model Context Protocol), which is how Claude Code connects to external services. You don't need to write any code. It's a one-line terminal command per tool.

## How it works

When you connect a tool via MCP, its capabilities become available to every agent and skill in Shipwright automatically. For example:

- Connect **Linear or Jira**, and the execution driver can read real tickets when planning sprints
- Connect **Amplitude or PostHog**, and the metrics dashboard skill can reference actual numbers
- Connect **Slack**, and the cross-functional liaison can read thread context when writing meeting summaries
- Connect **Notion**, and agents can read your existing docs and write new ones directly
- Connect **Figma**, and the design review skill can reference actual design files

You don't need to change any Shipwright files. The agents detect what tools are available and use them when relevant.

## Adding your first connection

Open your terminal (not inside Claude Code, just a regular terminal) and run:

```bash
claude mcp add --transport http <name> <url>
```

That's it. Here's what it looks like for common PM tools:

```bash
# Project management
claude mcp add --transport http linear https://linear.app/mcp
claude mcp add --transport http jira https://mcp.atlassian.com/mcp
claude mcp add --transport http asana https://mcp.asana.com/mcp

# Documentation
claude mcp add --transport http notion https://mcp.notion.com/mcp

# Communication
claude mcp add --transport http slack https://mcp.slack.com/mcp

# Analytics
claude mcp add --transport http amplitude https://mcp.amplitude.com/mcp

# Design
claude mcp add --transport http figma https://mcp.figma.com/mcp

# CRM
claude mcp add --transport http salesforce https://mcp.salesforce.com/mcp
claude mcp add --transport http hubspot https://mcp.hubspot.com/anthropic

# Payments
claude mcp add --transport http stripe https://mcp.stripe.com
```

Most of these will prompt you to authenticate through your browser the first time. Sign in with your normal work credentials.

## If your tool needs an API key

Some tools use API keys instead of browser login. Pass the key as a header:

```bash
claude mcp add --transport http jira https://mcp.atlassian.com/mcp \
  --header "Authorization: Bearer YOUR_API_KEY_HERE"
```

Your API key stays on your machine. It's stored in `~/.claude.json` and never sent anywhere except to the service you're connecting to.

## Sharing connections with your team

By default, connections are local to your machine. If you want your whole team to use the same connections (so everyone's Shipwright setup talks to the same Linear workspace, for example), add `--scope project`:

```bash
claude mcp add --transport http linear --scope project https://linear.app/mcp
```

This creates a `.mcp.json` file in your project root that you can commit to git. Team members will be prompted to approve the connection on their first session.

You can also use environment variables in the project config so credentials aren't committed:

```json
{
  "mcpServers": {
    "linear": {
      "type": "http",
      "url": "https://linear.app/mcp",
      "headers": {
        "Authorization": "Bearer ${LINEAR_API_KEY}"
      }
    }
  }
}
```

Each team member sets `LINEAR_API_KEY` in their own environment.

## Managing your connections

```bash
claude mcp list            # see everything you've connected
claude mcp get linear      # details on one connection
claude mcp remove linear   # disconnect a tool
```

Inside a Claude Code session, type `/mcp` to see which connections are active and what tools they provide.

## Programmatic web research without changing the UX

For public-web research, you can offload search and page retrieval to a local helper so Shipwright stays conversational while spending fewer tool calls on raw retrieval.

Shipwright includes `scripts/collect-research.mjs` in the repo and installs it to `.claude/scripts/collect-research.mjs` plus `.codex/scripts/collect-research.mjs` when you use `scripts/sync.sh --install`.

What it does:

- runs a programmatic web search
- fetches the top pages in parallel
- extracts a compact source digest
- writes `evidence.json` and `evidence.md` under `.shipwright/research/`
- writes `facts.json` with sparse, source-attributed pricing, product, review, date, and package-registry facts when they can be extracted deterministically
- uses structured-source adapters for npm, PyPI, and crates.io package metadata when available
- in v1, `facts.json` emits only `high` and `medium` `confidence_hint` values
- caches canonical evidence packs under `.shipwright/cache/research/v1/`
- escalates automatically from the primary query to broader subqueries and then to gap-only follow-up recommendations when needed

What the AI still does:

- judge relevance
- reconcile conflicting evidence
- synthesize findings
- write the final answer

Set one of these environment variables before starting Claude Code:

```bash
export BRAVE_SEARCH_API_KEY=...
# or
export TAVILY_API_KEY=...
```

If you prefer a local env file, `scripts/collect-research.mjs` also auto-loads `.env` from the current working directory. Example:

```bash
BRAVE_SEARCH_API_KEY=...
```

If you do not configure a provider key, the helper still runs and writes a fallback evidence pack with `needs-interactive-followup` plus suggested queries. That keeps the workflow conversational while nudging the agent onto interactive WebSearch or WebFetch only for the remaining gaps.

Then an agent can call the helper with Bash using a prompt that still feels conversational to the PM. Example:

```bash
node .claude/scripts/collect-research.mjs \
  --query "AI-powered customer support tools for mid-market SaaS pricing" \
  --max-results 5
```

This produces a compact evidence pack plus a machine-readable `facts.json` sidecar the model can synthesize instead of spending a long sequence of `WebSearch` and `WebFetch` calls on the same task.

The collector cache is local to the repo and keyed by the normalized query plus provider and retrieval settings. By default, a cache entry is reusable for 24 hours:

- `hit` means the collector reused a fresh cached evidence pack and wrote a served copy to the requested output directory
- `miss` means no matching cache entry was available, so the collector ran normal retrieval and then cached the result
- `refresh` means a matching cache entry existed but was older than the TTL, so the collector recollected and replaced it

If you want a different freshness window, pass `--cache-ttl-hours <n>`.

If the cache grows larger than you want locally, clear it with:

```bash
node scripts/collect-research.mjs --clear-cache
```

When the helper still cannot gather enough usable sources, or no provider is configured, it records `needs-interactive-followup` plus suggested follow-up queries. Agents should then use interactive browsing only for those remaining gaps.

If no provider is configured, the helper still writes the fallback evidence pack for the current run, but it does not cache that no-provider fallback output.

In Codex, this same pattern can be triggered from plain-language prompts when the project has a Shipwright-aware `AGENTS.md` and the helper exists at `.codex/scripts/collect-research.mjs` or `scripts/collect-research.mjs`.

## What to connect first

If you're not sure where to start, pick based on what you use Shipwright for most:

| If you mostly use... | Connect this first |
|---|---|
| Sprint planning, backlog work | Linear or Jira |
| Discovery, metrics, experiments | Amplitude or PostHog |
| Stakeholder updates, meeting notes | Slack + Notion |
| PRDs, strategy docs | Notion or Confluence |
| GTM, competitive analysis | Salesforce or HubSpot |

You don't need all of them. One or two connections that match your daily workflow will make a noticeable difference.

## Finding more tools

The MCP ecosystem is growing fast. Browse the full registry at:

https://registry.modelcontextprotocol.io

If your team uses a tool that isn't listed, check whether they've published an MCP server (many have in the last few months), or look for community-built servers on GitHub.

## Troubleshooting

**"Server not responding"** - Run `claude mcp list` and check the server URL. Some services update their MCP endpoints. Check the tool's docs for the current URL.

**"Authentication failed"** - Your token may have expired. Remove the connection (`claude mcp remove <name>`) and re-add it. For OAuth-based tools, this usually means signing in through your browser again.

**"Permission denied"** - The account you authenticated with may not have access to the workspace or project. Check your permissions in the tool itself.

**Agents aren't using the connected tool** - Make sure the connection is active (`/mcp` inside a session). If it shows as connected but agents aren't using it, try being explicit: "Use Linear to pull the current sprint tickets" or "Check Amplitude for our retention numbers."
