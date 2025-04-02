import * as dotenv from 'dotenv';
import { z } from 'zod';
import * as path from 'path';
import * as fs from 'fs';

// Better error handling for .env loading
console.log(`Current working directory: ${process.cwd()}`);
const envPath = path.resolve(process.cwd(), '.env');
console.log(`Looking for .env file at: ${envPath}`);

if (fs.existsSync(envPath)) {
  console.log('.env file found');
  dotenv.config();
} else {
  console.warn('.env file not found! Using environment variables if available.');
}

// Get values from environment or use values from .env file in src directory
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

console.log(`SUPABASE_URL defined: ${!!SUPABASE_URL}`);
console.log(`SUPABASE_KEY defined: ${!!SUPABASE_SERVICE_KEY}`);

// Define schema for environment variables
const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_KEY: z.string().min(1),
});

// Parse and validate configuration
export const config = {
  supabase: {
    url: SUPABASE_URL,
    key: SUPABASE_SERVICE_KEY,
  }
};

// Function to validate configuration
export function validateConfig() {
  try {
    envSchema.parse({
      SUPABASE_URL: SUPABASE_URL,
      SUPABASE_KEY: SUPABASE_SERVICE_KEY,
    });
    console.log('Configuration validated successfully');
  } catch (error) {
    console.error('Configuration error:', error);
    console.error('Please create a .env file in the project root with SUPABASE_URL and SUPABASE_KEY');
    process.exit(1);
  }
} 