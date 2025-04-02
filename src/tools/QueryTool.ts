import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SupabaseManager } from "../supabaseClient.js";

export function registerQueryTool(server: McpServer) {
  server.tool(
    "execute_query",
    {
      query: z.string().describe("SQL query to execute (only SELECT queries are allowed)"),
      limit: z.number().optional().describe("Maximum number of rows to return (default: 50)")
    },
    async ({ query, limit = 50 }) => {
      try {
        const supabaseManager = SupabaseManager.getInstance();
        const result = await supabaseManager.executeReadQuery(query, limit);

        if (result.error) {
          return {
            content: [{ type: "text", text: `Error: ${result.error}` }],
            isError: true
          };
        }

        const data = result.data || [];
        let response: string;

        if (data.length === 0) {
          response = "Query executed successfully, but no data was returned.";
        } else {
          response = formatAsMarkdownTable(data);
        }

        return {
          content: [{ type: "text", text: response }]
        };
      } catch (error) {
        const err = error as Error;
        return {
          content: [{ type: "text", text: `Error: ${err.message}` }],
          isError: true
        };
      }
    }
  );
}

function formatAsMarkdownTable(data: any[]): string {
  if (!data || data.length === 0) {
    return "No data to display";
  }
  
  // Get column headers from the first row
  const headers = Object.keys(data[0]);
  
  // Start building the markdown table
  let table = "| " + headers.join(" | ") + " |\n";
  table += "| " + headers.map(() => "---").join(" | ") + " |\n";
  
  // Add data rows
  for (const row of data) {
    const rowValues = headers.map(header => {
      let value = row[header];
      
      // Convert null to empty string and ensure all values are strings
      if (value === null || value === undefined) {
        value = "";
      } else if (typeof value !== 'string') {
        if (typeof value === 'object') {
          value = JSON.stringify(value);
        } else {
          value = String(value);
        }
      }
      
      // Escape pipe characters in the value
      return String(value).replace(/\|/g, "\\|");
    });
    
    table += "| " + rowValues.join(" | ") + " |\n";
  }
  
  return table;
} 