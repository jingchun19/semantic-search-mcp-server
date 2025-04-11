import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as dotenv from 'dotenv';
import { OpenAI } from "openai";

dotenv.config();

// Base URL for the OpenAI compatible API
const OPENAI_API_BASE = process.env.OPENAI_API_BASE || 'https://api.studio.nebius.com/v1/';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Generic agent caller function to handle API requests
async function callAgent(instructions: string, query: string, modelId: string, temperature: number = 0.3) {
  try {
    // Create OpenAI client inside the function
    const client = new OpenAI({
      baseURL: OPENAI_API_BASE,
      apiKey: OPENAI_API_KEY,
    });

    const completion = await client.chat.completions.create({
      model: modelId || "deepseek-ai/DeepSeek-V3",
      messages: [
        {
          role: "system",
          content: instructions
        },
        {
          role: "user",
          content: query
        }
      ],
      temperature: temperature
    });

    return completion.choices[0].message.content || "No response generated";
  } catch (error) {
    console.error('Error calling agent:', error);
    throw error;
  }
}

export function registerAgentTools(server: McpServer) {
  // 1. Planner Tool
  server.tool(
    "planner",
    {
      query: z.string().describe("The planning request or question to address")
    },
    async ({ query }) => {
      try {
        const instructions = `Current date: ${new Date().toISOString().split('T')[0]}
You are a strategic planner specialized in organizing market research and analysis.
Your responsibilities:
1. Break down complex research questions into structured components.
2. Create detailed research plans with clear objectives and methodologies.
3. Identify key areas for investigation and required resources.
4. Recommend timeframes for project phases and deliverables.
5. Define success criteria and metrics for research goals.
6. Suggest alternative approaches when initial plans face obstacles.
7. Prioritize research directions based on business impact and feasibility.
8. Design frameworks for organizing and categorizing research findings.
Focus on creating comprehensive, actionable plans that address all aspects of the research need.`;

        const response = await callAgent(instructions, query, process.env.DEEPSEEK_AGENT_MODEL_ID || "deepseek-ai/DeepSeek-V3", 0.2);

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

  // 2. Researcher Tool with Tavily search capability
  server.tool(
    "researcher",
    {
      query: z.string().describe("The research question or information to investigate")
    },
    async ({ query }) => {
      try {
        const instructions = `Current date: ${new Date().toISOString().split('T')[0]}
You are a research specialist focused on gathering information for market analysis.
Your responsibilities:
1. Gather relevant information about markets, competitors, and trends.
2. Identify authoritative sources for market research data.
3. Evaluate the credibility and relevance of information sources.
4. Collect both quantitative and qualitative data for analysis.
5. Document source information for proper attribution.
6. Organize research findings in structured, accessible formats.
7. Fill knowledge gaps by identifying additional research needs.
8. Prioritize research directions based on information value.

IMPORTANT: You do NOT have direct web search capability. When you need to search for information online, you MUST explicitly request a Tavily search using this exact format:

<tavily_search>
SEARCH QUERY: [Your specific, focused search query here]
</tavily_search>

Guidelines for effective search requests:
1. Make search queries specific and focused
2. Use separate search requests for different topics
3. Include key terms, dates, and specific entities in your queries
4. Phrase queries as specific questions or statements
5. Request multiple searches if needed to cover different aspects

After requesting searches, analyze the search results and provide insights based on the information received. Remember to critically evaluate all information for credibility and relevance.`;

        const response = await callAgent(instructions, query, process.env.DEEPSEEK_AGENT_MODEL_ID || "deepseek-ai/DeepSeek-V3", 0.3);

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

  // 3. Analyzer Tool
  server.tool(
    "analyzer",
    {
      query: z.string().describe("The analysis request or data to analyze")
    },
    async ({ query }) => {
      try {
        const instructions = `Current date: ${new Date().toISOString().split('T')[0]}
You are a data analyst specialized in interpreting market research and business information.
Your responsibilities:
1. Examine qualitative and quantitative data to identify patterns and insights.
2. Apply analytical frameworks to evaluate business models and strategies.
3. Perform SWOT analysis, competitive positioning, and market segmentation.
4. Assess market trends and their implications for business opportunities.
5. Evaluate the significance of research findings in business contexts.
6. Identify causal relationships and correlations in market phenomena.
7. Develop evidence-based interpretations of complex information.
8. Present analysis in clear, structured formats with visual elements where appropriate.
Focus on delivering insightful analysis that goes beyond surface observations.`;

        const response = await callAgent(instructions, query, process.env.DEEPSEEK_AGENT_MODEL_ID || "deepseek-ai/DeepSeek-V3", 0.3);

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

  // 4. Critic Tool
  server.tool(
    "critic",
    {
      query: z.string().describe("The content to evaluate or critique")
    },
    async ({ query }) => {
      try {
        const instructions = `Current date: ${new Date().toISOString().split('T')[0]}
You are a critical analyst specialized in evaluating research quality and business recommendations.
Your responsibilities:
1. Assess the strength and validity of evidence and arguments.
2. Identify logical fallacies, cognitive biases, and methodological weaknesses.
3. Evaluate the completeness and balance of analysis.
4. Challenge assumptions and question conventional thinking.
5. Provide constructive criticism on research approach and conclusions.
6. Consider alternative perspectives and contrary evidence.
7. Assess whether conclusions are justified by the available evidence.
8. Recommend improvements to strengthen reasoning and research quality.
Focus on providing balanced, constructive criticism that improves analytical quality.`;

        const response = await callAgent(instructions, query, process.env.DEEPSEEK_AGENT_MODEL_ID || "deepseek-ai/DeepSeek-V3", 0.3);

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

  // 5. Synthesizer Tool
  server.tool(
    "synthesizer",
    {
      query: z.string().describe("The information to synthesize or integrate")
    },
    async ({ query }) => {
      try {
        const instructions = `Current date: ${new Date().toISOString().split('T')[0]}
You are a research synthesizer specialized in integrating diverse information into coherent outputs.
Your responsibilities:
1. Combine research findings from multiple sources into unified narratives.
2. Identify common themes and patterns across different analyses.
3. Reconcile contradictory information and competing perspectives.
4. Distill complex information into clear, accessible summaries.
5. Structure information to highlight key insights and relationships.
6. Connect discrete findings to create a more complete understanding.
7. Develop frameworks that organize information meaningfully.
8. Create output that is greater than the sum of its informational parts.
Focus on creating coherent, insightful syntheses that transform information into knowledge.`;

        const response = await callAgent(instructions, query, process.env.DEEPSEEK_AGENT_MODEL_ID || "deepseek-ai/DeepSeek-V3", 0.3);

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

  // 6. FactChecker Tool with BraveSearch capability
  server.tool(
    "factchecker",
    {
      query: z.string().describe("The statements or claims to verify")
    },
    async ({ query }) => {
      try {
        const instructions = `Current date: ${new Date().toISOString().split('T')[0]}
You are a fact-checker specialized in verifying information in business and market research.
Your responsibilities:
1. Evaluate the accuracy of factual claims and statements.
2. Check numeric data, statistics, and quantitative assertions for correctness.
3. Verify attribution of quotes, concepts, and findings to sources.
4. Identify potential misinformation, outdated data, or unsubstantiated claims.
5. Assess the reliability and credibility of information sources.
6. Distinguish between facts, opinions, and speculative claims.
7. Correct factual errors while maintaining the integrity of analysis.
8. Suggest appropriate qualifiers for claims with limited evidence.

IMPORTANT: You do NOT have direct web search capability. When you need to verify information online, you MUST explicitly request a BraveSearch using this exact format:

<brave_search>
SEARCH QUERY: [Your specific verification query here]
</brave_search>

Guidelines for effective fact-checking searches:
1. Focus search queries on specific facts, claims, or statistics to verify
2. Include the exact claim along with keywords like "fact check" or "verification"
3. Search for primary sources, official statistics, and authoritative references
4. Frame searches to find multiple perspectives or sources on contested claims
5. Request separate searches for distinct facts that need verification

After requesting searches, analyze the search results to verify the original claims. For each claim, provide:
1. The original claim being verified
2. Your verification assessment (Verified, Partially Verified, Unverified, or False)
3. The evidence supporting your assessment, citing specific sources
4. Any necessary context, qualifications, or corrections

Focus on ensuring accuracy and reliability in all factual aspects of the research.`;

        const response = await callAgent(instructions, query, process.env.DEEPSEEK_AGENT_MODEL_ID || "deepseek-ai/DeepSeek-V3", 0.3);

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

  // 7. DocumentManager Tool
  server.tool(
    "documentmanager",
    {
      query: z.string().describe("The market research information to format into a structured report")
    },
    async ({ query }) => {
      try {
        const instructions = `Current date: ${new Date().toISOString().split('T')[0]}
You are a specialized documentation expert focused on structuring professional market research reports.

Your responsibilities:
1. Transform raw market research data into comprehensive, well-formatted reports
2. Structure information using a consistent, professional format tailored for business stakeholders
3. Create clear section hierarchies with proper headings and subheadings
4. Develop compelling executive summaries that highlight key findings and business implications
5. Ensure visual clarity with appropriate use of bullet points, tables, and formatting
6. Standardize industry terminology and maintain professional language throughout
7. Apply consistent formatting and citation styles for all referenced sources
8. Balance technical details with strategic insights appropriate for executive audiences

ALWAYS structure market research reports in this specific format:

## Market Research Report: [Project Name]

## 1. Market Overview and Objectives
[High-level summary of the market scope and primary research goals]

## 2. Competitive Landscape
[Analysis of direct and indirect competitors, including existing projects in the industry]

## 3. Market Segmentation
[Breakdown of target demographics and customer segments]

## 4. Customer Profiles and Behaviors
[Key customer traits and buying patterns]

## 5. Regulatory and Compliance Considerations
[Legal factors impacting market entry or operation]

## 6. Distribution and Partnership Opportunities
[Potential channels and strategic alliances]

## 7. Marketing and Branding Approach
[Positioning and promotional tactics]

## 8. Financial Projections and Budgetary Needs
[Initial cost estimates and ROI analysis]

## 9. Potential Risks and Mitigation Strategies
[Identified obstacles and contingency plans]

## 10. Actionable Recommendations
[Summary of key insights and proposed next steps]

For each section:
- Include only factual information from the provided research
- Highlight key data points and statistics when available
- Identify gaps in information that require further research
- Present information in a business-focused, actionable manner
- Keep formatting consistent throughout the document

Your goal is to transform unstructured market research into an executive-ready, professional document that supports strategic decision-making.`;

        const response = await callAgent(instructions, query, process.env.DEEPSEEK_AGENT_MODEL_ID || "deepseek-ai/DeepSeek-V3", 0.3);

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

  // 8. Coordinator Tool - Using R1 model
  server.tool(
    "coordinator",
    {
      query: z.string().describe("The market research question or task to coordinate"),
      includeTeamPlan: z.boolean().optional().default(true).describe("Whether to include a specific sequence of agent consultations")
    },
    async ({ query, includeTeamPlan = true }) => {
      try {
        const instructions = `Current date: ${new Date().toISOString().split('T')[0]}
You are a research coordinator specialized in organizing comprehensive market research projects.
Your task is to break down the user's market research query into a strategic plan with specific steps.

IMPORTANT: After analyzing the query, you MUST provide a clear team consultation plan focused on these key market research categories:

<market_insights>
1. Market Opportunities & Entry Strategy
2. Target Audience & Demographics
3. Distribution Channels & Local Platforms
4. Cultural Adaptation & Consumer Behavior
5. Data Collection & Analysis Requirements
6. Legal, Regulatory, & Compliance Factors
7. Local Partnerships & Strategic Integrations
8. Scalability & Future Growth
9. Operational & Logistical Challenges
10. Financial Considerations & Budget Estimates
11. Existing Projects & Competitors
12. Government-Supported Projects
</market_insights>

Format your team consultation plan like this:
TEAM CONSULTATION PLAN:
1. [AGENT: Planner] First, the Planner should... <specific question related to market opportunity>
2. [AGENT: Researcher] Next, the Researcher should... <specific research question>
... and so on with specific questions for each recommended agent

Choose from these specialist agents:
- Planner: Strategic planning and market entry strategies
- Researcher: Information gathering on markets, competitors, and trends
- Analyzer: Data analysis of market metrics and consumer patterns
- Critic: Critical evaluation of market approaches and potential pitfalls
- Synthesizer: Integration of diverse market insights
- FactChecker: Verification of market claims and statistics
- DocumentManager: Formatting the final market research report

For each agent, provide a specific question or task that:
1. Leverages their unique expertise
2. Focuses on one or more of the key market research categories
3. Contributes to a comprehensive market analysis

Your plan should be logical, comprehensive, and directly address all the key market research categories.`;

        // Use DeepSeek-R1 specifically for the coordinator
        const response = await callAgent(instructions, query, "deepseek-ai/DeepSeek-R1", 0.4);

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