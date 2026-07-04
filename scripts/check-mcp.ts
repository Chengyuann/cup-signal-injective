import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: process.execPath,
  args: ["./node_modules/tsx/dist/cli.mjs", "mcp/cup-signal-mcp.ts"],
  cwd: process.cwd(),
  stderr: "pipe",
});

const client = new Client({
  name: "cup-signal-check",
  version: "0.1.0",
});

await client.connect(transport);

const tools = await client.listTools();
const forecast = await client.callTool({
  name: "forecast_match",
  arguments: { matchId: "cup-001" },
});
const brief = await client.callTool({
  name: "build_watch_brief",
  arguments: { matchId: "cup-001" },
});

console.log(
  JSON.stringify(
    {
      tools: tools.tools.map((tool) => tool.name),
      forecastContentItems: contentLength(forecast),
      briefContentItems: contentLength(brief),
    },
    null,
    2,
  ),
);

await client.close();

function contentLength(result: unknown): number {
  if (
    result &&
    typeof result === "object" &&
    "content" in result &&
    Array.isArray((result as { content?: unknown }).content)
  ) {
    return (result as { content: unknown[] }).content.length;
  }
  return 0;
}
