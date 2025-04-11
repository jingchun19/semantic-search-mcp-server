import express from 'express';
import cors from 'cors';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { validateConfig } from "./config.js";
import { registerResources } from "./resources.js";
import { registerSemanticSearchTool } from "./tools/SemanticSearchTool.js";
import { registerQueryTool } from "./tools/QueryTool.js";
import { registerAgentTools } from "./tools/AgentTools.js";

async function main() {
  try {
    // Validate configuration
    validateConfig();

    // Check if we should use stdio or SSE transport
    const useStdio = process.argv.includes('--stdio') || process.argv.includes('-s');
    
    if (useStdio) {
      console.log("Starting Supabase MCP server with stdio transport...");
      
      // Create MCP server
      const server = new McpServer({
        name: "supabase-mcp-server",
        version: "1.0.0"
      });

      // Register resources and tools
      registerResources(server);
      registerSemanticSearchTool(server);
      registerQueryTool(server);
      registerAgentTools(server);

      // Set up stdio transport
      const transport = new StdioServerTransport();
      server.connect(transport);
      
      console.log("Supabase MCP server running with stdio transport");
    } else {
      console.log("Starting Supabase MCP server with SSE transport...");

      // Create Express app
      const app = express();
      app.use(cors());
      app.use(express.json());

      // Create MCP server
      const server = new McpServer({
        name: "supabase-mcp-server",
        version: "1.0.0"
      });

      // Register resources and tools
      registerResources(server);
      registerSemanticSearchTool(server);
      registerQueryTool(server);
      registerAgentTools(server);

      // Set up SSE transport
      let transport: SSEServerTransport | null = null;

      // SSE endpoint for client connections
      app.get("/sse", (req, res) => {
        console.log("New SSE connection established");
        transport = new SSEServerTransport("/messages", res);
        server.connect(transport);
      });

      // POST endpoint for receiving messages
      app.post("/messages", (req, res) => {
        if (transport) {
          transport.handlePostMessage(req, res);
        } else {
          res.status(400).json({ error: "No active SSE connection" });
        }
      });

      // Simple health check endpoint
      app.get("/ping", (req, res) => {
        res.status(200).send("pong");
      });

      // Start server
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}...`);
      });
    }
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

main();