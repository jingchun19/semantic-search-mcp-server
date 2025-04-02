import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SupabaseManager } from "../supabaseClient.js";

export function registerSemanticSearchTool(server: McpServer) {
  // Register the semantic search tool
  server.tool(
    "search_companies",
    {
      query: z.string().describe("Search query to find relevant companies"),
      top_k: z.number().default(5).describe("Maximum number of companies to return (default: 5)"),
      threshold: z.number().default(0.3).describe("Minimum similarity threshold (0-1, default: 0.3)")
    },
    async ({ query, top_k, threshold}) => {
      try {
        const supabaseManager = SupabaseManager.getInstance();
        const result = await supabaseManager.search(query, "match_company_chunks", top_k, threshold);

        if (result.error) {
          return {
            content: [{ type: "text", text: `Error: ${result.error}` }],
            isError: true
          };
        }

        if (!result.data || result.data.length === 0) {
          return {
            content: [{ type: "text", text: `No matching companies found for '${query}'` }]
          };
        }

        // Group chunks by company
        const companyMap = new Map();
        
        result.data.forEach((item: any, index: number) => {
          const companyId = item.company_id;
          
          if (!companyMap.has(companyId)) {
            companyMap.set(companyId, {
              index,
              id: companyId,
              company_name: item.company_name || "Unknown Company",
              industry: item.industry || "N/A",
              search_score: item.similarity,
              matching_chunks: []
            });
          }
          
          companyMap.get(companyId).matching_chunks.push({
            content: item.content,
            similarity: item.similarity
          });
        });
        
        // Convert to array and sort by search score
        const companies = Array.from(companyMap.values());
        companies.sort((a: any, b: any) => b.search_score - a.search_score);
        
        // Format response
        let response = `# Found ${companies.length} matching companies:\n\n`;
        
        companies.forEach((company: any, i: number) => {
          response += `## Result #${i+1}: ${company.company_name}\n`;
          response += `Company ID: ${company.id}\n`;
          response += `Industry: ${company.industry}\n`;
          response += `Match Score: ${(company.search_score * 100).toFixed(2)}%\n\n`;
          
          // Show matching chunks
          response += `### Matching content:\n`;
          
          // Sort chunks by similarity and get top 2
          company.matching_chunks.sort((a: any, b: any) => b.similarity - a.similarity);
          company.matching_chunks.slice(0, 2).forEach((chunk: any) => {
            response += `• ${chunk.content.substring(0, 150)}...\n\n`;
          });
          
          response += `To see full details, use the get_company_details tool with company_id: ${company.id}\n\n`;
          response += "---\n\n";
        });
        
        response += "To view full details of a company, use the get_company_details tool with the company ID.";

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

  // Add timeout to getCompanyById method in SupabaseManager
  async function getCompanyDetailsWithTimeout(company_id: string, timeoutMs = 5000) {
    // Create a promise that rejects after the timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    // Create the actual operation promise
    const operationPromise = new Promise(async (resolve) => {
      const supabaseManager = SupabaseManager.getInstance();
      const result = await supabaseManager.getCompanyById(company_id);
      resolve(result);
    });

    // Race the operation against the timeout
    return Promise.race([operationPromise, timeoutPromise]);
  }

  // Tool to get company details by ID
  server.tool(
    "get_company_details",
    {
      company_id: z.string().describe("The ID of the company to get details for")
    },
    async ({ company_id }) => {
      try {
        console.log(`Getting company details for ID: ${company_id}`);
        const result = await getCompanyDetailsWithTimeout(company_id, 5000);
        const { data, error } = result as any;
        
        if (error) {
          return {
            content: [{ 
              type: "text", 
              text: `Error querying database: ${error}` 
            }],
            isError: true
          };
        }
        
        if (!data) {
          return {
            content: [{ 
              type: "text", 
              text: `No company found with ID "${company_id}". Please try a different ID.` 
            }],
            isError: true
          };
        }
        
        const companyDetails = data;
        
        // Format detailed response
        let response = `# COMPANY DETAILS: ${companyDetails.company_name}\n`;
        response += `${"=".repeat(80)}\n\n`;
        
        response += `Company ID: ${companyDetails.id}\n`;
        response += `Industry: ${companyDetails.industry || "N/A"}\n`;
        response += `Website: ${companyDetails.website || "N/A"}\n`;
        response += `Business Model: ${companyDetails.business_model || "N/A"}\n`;
        response += `Location: ${companyDetails.location || "N/A"}\n\n`;
        
        response += `## Description\n`;
        response += `${companyDetails.description || "No description available."}\n\n`;
        
        response += `## Contacts\n`;
        
        if (companyDetails.contacts && companyDetails.contacts.length > 0) {
          companyDetails.contacts.forEach((contact: any) => {
            response += `• ${contact.first_name || ""} ${contact.last_name || ""}\n`;
            response += `  Position: ${contact.designation || "N/A"}\n`;
            response += `  Email: ${contact.email || "N/A"}\n`;
            response += `  Phone: ${contact.phone_country_code || ""} ${contact.phone_number || "N/A"}\n\n`;
          });
        } else {
          response += "No contacts available.\n";
        }
        
        response += `${"=".repeat(80)}\n`;

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