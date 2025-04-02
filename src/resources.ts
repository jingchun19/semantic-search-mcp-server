import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SupabaseManager } from "./supabaseClient.js";

export function registerResources(server: McpServer) {
  // Register static schema resource
  server.resource(
    "database-schema",
    "supabase://schema",
    async (uri) => {
      try {
        const supabaseManager = SupabaseManager.getInstance();
        const tables = await supabaseManager.getTables();
        
        let content = "# Supabase Database Schema\n\n";
        content += "## Available Tables\n\n";
        
        if (tables.length === 0) {
          content += "No tables found in the database.";
        } else {
          tables.forEach((table: string) => {
            content += `- [${table}](supabase://tables/${table})\n`;
          });
        }
        
        return {
          contents: [{
            uri: uri.href,
            text: content,
            mimeType: "text/markdown"
          }]
        };
      } catch (error) {
        const err = error as Error;
        return {
          contents: [{
            uri: uri.href,
            text: `Error: ${err.message}`,
            mimeType: "text/plain"
          }]
        };
      }
    }
  );

  // Register table schema resources
  server.resource(
    "table-schema",
    new ResourceTemplate("supabase://tables/{tableName}", { list: undefined }),
    async (uri, { tableName }) => {
      try {
        const supabaseManager = SupabaseManager.getInstance();
        const schema = await supabaseManager.getTableSchema(tableName as string);
        
        let content = `# Table: ${tableName}\n\n`;
        content += "## Schema\n\n";
        content += "| Column | Type | Nullable | Default |\n";
        content += "| ------ | ---- | -------- | ------- |\n";
        
        if (schema.columns.length === 0) {
          content += "| No columns found | | | |\n";
        } else {
          schema.columns.forEach((column: any) => {
            const isNullable = column.is_nullable === 'YES' ? "YES" : "NO";
            const defaultValue = column.column_default || "";
            content += `| ${column.column_name} | ${column.data_type} | ${isNullable} | ${defaultValue} |\n`;
          });
        }
        
        return {
          contents: [{
            uri: uri.href,
            text: content,
            mimeType: "text/markdown"
          }]
        };
      } catch (error) {
        const err = error as Error;
        return {
          contents: [{
            uri: uri.href,
            text: `Error: ${err.message}`,
            mimeType: "text/plain"
          }]
        };
      }
    }
  );

  // Register company search resources
  server.resource(
    "company-search",
    new ResourceTemplate("supabase://search/companies/{query}", { list: undefined }),
    async (uri, { query }) => {
      try {
        const supabaseManager = SupabaseManager.getInstance();
        const result = await supabaseManager.search(query as string);
        
        let content: string;
        
        if (result.error) {
          content = `# Error searching for '${query}'\n\n`;
          content += `Error: ${result.error}`;
        } else {
          const companies = result.data || [];
          content = `# Companies matching '${query}'\n\n`;
          
          if (companies.length === 0) {
            content += "No companies found matching your query.";
          } else {
            companies.forEach((company: any) => {
              content += `## ${company.name}\n\n`;
              
              if (company.description) {
                content += `${company.description}\n\n`;
              }
              
              if (company.industry) {
                content += `**Industry**: ${company.industry}\n`;
              }
              
              if (company.website) {
                content += `**Website**: ${company.website}\n`;
              }
              
              content += "\n---\n\n";
            });
          }
        }
        
        return {
          contents: [{
            uri: uri.href,
            text: content,
            mimeType: "text/markdown"
          }]
        };
      } catch (error) {
        const err = error as Error;
        return {
          contents: [{
            uri: uri.href,
            text: `Error: ${err.message}`,
            mimeType: "text/plain"
          }]
        };
      }
    }
  );
} 