import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config.js';
import { OpenAI } from "openai";

export interface TableSchema {
  table_name: string;
  columns: Array<{
    column_name: string;
    data_type: string;
    is_nullable: string;
    column_default: string | null;
  }>;
}

export interface SearchResult {
  data: any[] | null;
  error: string | null;
}

export class SupabaseManager {
  private static instance: SupabaseManager;
  private client: SupabaseClient;
  private openaiClient: OpenAI | null = null;
  private embeddingModel: string = "text-embedding-3-small";
  private chunksTable: string = "company_chunks";
  
  // Cache search results for company details lookup
  private lastSearchResults: any[] = [];

  private constructor() {
    // Initialize Supabase client
    this.client = createClient(
      config.supabase.url as string,
      config.supabase.key as string
    );
    
    // Initialize OpenAI client if API key is available
    if (process.env.OPENAI_API_KEY) {
      this.openaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
  }

  public static getInstance(): SupabaseManager {
    if (!SupabaseManager.instance) {
      SupabaseManager.instance = new SupabaseManager();
    }
    return SupabaseManager.instance;
  }
  
  /**
   * Get the Supabase client instance
   * @returns The Supabase client
   */
  getClient(): SupabaseClient {
    return this.client;
  }

  async getTables(): Promise<string[]> {
    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    const { data, error } = await this.client.rpc('execute_sql', { query });
    
    if (error) {
      console.error('Error fetching tables:', error);
      return [];
    }
    
    return data.map((table: any) => table.table_name);
  }

  async getTableSchema(tableName: string): Promise<TableSchema> {
    const query = `
      SELECT 
        column_name, 
        data_type,
        is_nullable,
        column_default
      FROM 
        information_schema.columns
      WHERE 
        table_schema = 'public' AND 
        table_name = '${tableName}'
    `;
    
    const { data, error } = await this.client.rpc('execute_sql', { query });
    
    if (error) {
      console.error(`Error fetching schema for table ${tableName}:`, error);
      return { table_name: tableName, columns: [] };
    }
    
    return {
      table_name: tableName,
      columns: data
    };
  }

  async executeReadQuery(query: string, limit: number = 50): Promise<{ data: any[] | null; error: string | null }> {
    // Check if the query is read-only (SELECT only)
    if (!this.isReadOnlyQuery(query)) {
      return {
        data: null,
        error: 'Only SELECT queries are allowed for security reasons'
      };
    }

    // Add LIMIT clause if not present
    if (!query.toLowerCase().includes('limit ')) {
      query = `${query} LIMIT ${limit}`;
    }

    try {
      const { data, error } = await this.client.rpc('execute_sql', { query });
      
      if (error) {
        return { data: null, error: error.message };
      }
      
      return { data, error: null };
    } catch (e) {
      const error = e as Error;
      return { data: null, error: error.message };
    }
  }

  async search(
    query: string, 
    matchFunction: string = "match_company_chunks", 
    topK: number = 10, 
    threshold: number = 0.3
  ): Promise<SearchResult> {
    try {
      if (!this.openaiClient) {
        throw new Error("OpenAI client not initialized. Please provide OPENAI_API_KEY in environment.");
      }
      
      // Get embedding for query
      const embeddingResponse = await this.openaiClient.embeddings.create({
        model: this.embeddingModel,
        input: query
      });
      
      const queryEmbedding = embeddingResponse.data[0].embedding;
      
      // Execute search using RPC function
      const { data, error } = await this.client.rpc(
        matchFunction,
        {
          query_embedding: queryEmbedding,
          match_threshold: threshold,
          match_count: topK
        }
      );
      
      if (error) {
        return { data: null, error: error.message };
      }
      
      // Cache results for later lookup
      this.lastSearchResults = data;
      
      return { data, error: null };
    } catch (e) {
      const error = e as Error;
      console.error(`Error searching vector store: ${error.message}`);
      return { data: null, error: error.message };
    }
  }
  
  // Get a specific company by index from last search results
  getCompanyByIndex(index: number): any {
    if (index < 0 || index >= this.lastSearchResults.length) {
      return null;
    }
    return this.lastSearchResults[index];
  }
  
  // Get a company by ID
  async getCompanyById(companyId: string): Promise<{ data: any | null; error: string | null }> {
    try {
      const { data, error } = await this.client
        .from('companies')
        .select(`
          *,
          contacts(*)
        `)
        .eq('id', companyId)
        .single();
        
      if (error) {
        return { data: null, error: error.message };
      }
      
      return { data, error: null };
    } catch (e) {
      const error = e as Error;
      return { data: null, error: error.message };
    }
  }

  private isReadOnlyQuery(query: string): boolean {
    // Clean and normalize the query
    const cleanedQuery = query.trim().toLowerCase().replace(/\s+/g, ' ');
    
    // Check if it's a SELECT query (or WITH followed by SELECT)
    const isSelect = cleanedQuery.startsWith('select ') || 
                    /^with\s+.+\s+select/.test(cleanedQuery);
    
    // Make sure it doesn't contain any data modification keywords
    const noModification = !['insert', 'update', 'delete', 'drop', 'alter', 'create', 'truncate']
      .some(keyword => cleanedQuery.includes(keyword));
    
    return isSelect && noModification;
  }
} 