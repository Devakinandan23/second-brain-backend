# Second Brain MCP: local development to private production

This server exposes two read-only tools for one configured Second Brain account.
It does not create, update, delete, or share notes. It does not call an LLM.

## The components

- **Host:** the AI application, such as Codex.
- **Client:** the MCP connector inside that host.
- **Server:** this program, exposing Second Brain tools.
- **Application services:** owner-scoped note queries, shared by both transports.

```text
AI host / MCP client
    -> stdio (local) OR HTTPS POST /mcp (hosted)
    -> MCP tool handler
    -> note service (configured owner's ID)
    -> PostgreSQL via Prisma
```

Local describes the MCP process, not necessarily the database: a local process
can connect to a hosted PostgreSQL database.

## Prerequisites and configuration

Use Node.js 22.12 or later, npm, and a reachable Second Brain database with the
existing schema and an existing user account. Use a currently supported Node.js
LTS version for hosting. Do not run database migrations against production just
to try the MCP server.

```bash
npm ci
cp example.env .env
```

Edit `.env` to set the real `DATABASE_URL` and `MCP_OWNER_USER_ID`. The latter is
the numeric ID of your own existing account, not your username and not an ID
chosen by a tool call. Look it up in your database administration tool. Startup
checks that the account exists. No sample account or database is created.

The existing `JWT_SECRET` is required by the web backend; MCP HTTP uses a separate
private credential rather than the app's four-hour login token.

```bash
npm run build
npm run mcp:stdio
```

The stdio process waits for protocol messages; an idle terminal is expected.
This command is for a terminal. For an MCP host, launch `node` directly as below
so npm's script banner cannot contaminate the protocol's stdout stream.

## Connect Codex locally

Run this from the backend directory after configuring `.env` and building:

```bash
codex mcp add second-brain -- node --env-file="$PWD/.env" "$PWD/dist/src/mcp/stdio.js"
codex mcp list
```

The absolute paths let the host launch the server from any working directory.
Restart or reconnect the host if it does not pick up the new entry immediately.
Try: "Find my notes about MCP" and then "Read the first matching note."

For interactive protocol debugging, launch MCP Inspector:

```bash
npx @modelcontextprotocol/inspector node --env-file="$PWD/.env" "$PWD/dist/src/mcp/stdio.js"
```

The `.env` file and generated build output are ignored by Git. Anyone who can
launch this process with your database configuration can access the configured
owner's notes; protect that configuration as you would the backend's secrets.

## Tool contracts

| Tool | Arguments | Behavior |
| --- | --- | --- |
| `search_notes` | `query` (1–200 trimmed characters), optional integer `limit` (1–20, default 5) | Case-insensitive matching across title, content, description, link, and tags; bounded summaries ordered by update time and ID. |
| `get_note` | `id` (UUID) | Reads one active note owned by the configured account; returns a bounded body and truncation information. |

Trashed notes and other users' notes are excluded in the database query. A
foreign, missing, or trashed ID gets the same not-found result. Neither tool
accepts `userId`, database credentials, or an authentication token as an argument.
Note bodies are capped at 20,000 characters to limit model context consumption.
Returned notes are data; their contents must not be treated as trusted system
instructions by the host.

## What stdio and JSON-RPC do

`stdio` is the transport: the client launches a child process and writes messages
to its `stdin`. The server writes responses to `stdout`. Each message is one
UTF-8 JSON object followed by a newline. Diagnostics go only to `stderr`.

JSON-RPC 2.0 defines the envelope. This abbreviated example omits MCP version
metadata, which the SDK adds or negotiates for the connected client's version:

```json
{"jsonrpc":"2.0","id":7,"method":"tools/call","params":{"name":"search_notes","arguments":{"query":"MCP","limit":5}}}
```

- `jsonrpc` is the JSON-RPC version, separate from the MCP protocol revision.
- `id` correlates a request with its response; it is not a user ID.
- `method` is the protocol operation; the selected tool is in `params.name`.
- A response contains `result` or `error`, never both.
- A notification has no `id` and gets no JSON-RPC response.

The SDK owns framing, discovery, argument validation, and response envelopes.
Both tools have read-only annotations; actual access control is enforced by
the service queries rather than by those annotations.

The current TypeScript SDK v2 supports the 2026-07-28 protocol and compatibility
with 2025 clients. Older clients open with `initialize` and
`notifications/initialized`; modern clients use discovery and per-request
protocol metadata. The implementation keeps compatibility enabled rather than
hand-writing either handshake.

## Private HTTP access

The same backend process can expose `/mcp`. It is disabled by default, leaving
the existing web API startup behavior unchanged. Configure these before enabling:

```dotenv
MCP_ENABLED=true
MCP_OWNER_USER_ID=<your-existing-numeric-user-id>
MCP_API_KEY=<a-separate-random-key-at-least-32-characters-long>
MCP_ALLOWED_HOSTS=localhost,127.0.0.1
MCP_ALLOWED_ORIGINS=
```

Generate the key in a password manager and store it in your local secret file or
hosting secret store. Never put it in a URL, tool arguments, Git, or screenshots.

```bash
npm start
```

Connect an HTTP-capable MCP client to `http://localhost:3001/mcp` and configure
`Authorization: Bearer <your-key>`. Headerless native clients are allowed; a
request that supplies an Origin must match the explicit origin allowlist. Add
the exact origin of a trusted browser client only when needed. Host validation
uses `MCP_ALLOWED_HOSTS`. The endpoint limits JSON bodies and request rate, and
never uses browser session cookies as MCP authorization.

This is deliberately **private single-owner authentication**, not an OAuth
authorization server. Possession of the key grants access to the configured
owner's active notes. For multiple users, replace this mapping with per-user
OAuth access tokens, scopes, and validated user identities before opening access.

## Deploy the same implementation

1. Deploy this backend repository to a managed Node.js service with PostgreSQL
   access. Build using `npm ci && npm run build`; start using `npm start`.
2. Set the backend's existing environment variables plus the MCP settings in
   the hosting secret store. Use your real API hostname in `MCP_ALLOWED_HOSTS`.
   Set `MCP_ENABLED=true` only after the owner and key are configured.
3. Terminate TLS at the platform's HTTPS endpoint and route `/mcp` to the same
   process. Preserve authorization, host, and MCP protocol headers. Ensure any
   proxy permits request-scoped SSE responses without buffering.
4. Use `/health` for process health and `/ready` for database readiness. Verify
   that an unauthenticated `/mcp` request is rejected, then discover and call both
   tools using an authenticated MCP client.
5. Reconnect your client to the HTTPS endpoint. For Codex, make the server key
   available to the Codex process as `SECOND_BRAIN_MCP_TOKEN`, then register:

   ```bash
   codex mcp add second-brain-remote --url https://your-backend-domain.com/mcp --bearer-token-env-var SECOND_BRAIN_MCP_TOKEN
   ```

The note services and tool contracts stay the same. Transport, credentials,
process lifecycle, and operational settings change. Streamable HTTP accepts
JSON-RPC POSTs and can respond with JSON or SSE; it is not the old standalone
HTTP+SSE transport. This service uses the SDK's stateless serving path and does
not need in-memory MCP sessions or sticky routing. The rate limiter is per
process; use a shared gateway limit before scaling to multiple instances. To
disable remote MCP, set `MCP_ENABLED=false` and restart the service.

Pushing code to GitHub does not deploy a running MCP endpoint. This guide prepares
deployment; it does not provision a database, publish credentials, or create a
cloud service.

## Verification and interview demo

```bash
npm run build
npm run typecheck
npm run test:mcp
```

Tests use isolated fake note data, not production data. Demonstrate discovery of
exactly two tools, successful search/read, invalid inputs, unknown notes, and
rejection of missing or wrong HTTP credentials. Use the local client to explain
one request end to end, then connect the HTTP client and identify which parts
of the application did not need to change.

References: [MCP specification](https://modelcontextprotocol.io/specification/2026-07-28),
[TypeScript SDK](https://ts.sdk.modelcontextprotocol.io/v2/),
[JSON-RPC 2.0](https://www.jsonrpc.org/specification).
