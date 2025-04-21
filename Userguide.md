# Claude Desktop Setup Guide for Project Teams
## Setting up Claude with Model Context Protocol (MCP) Servers

---

## Introduction

This guide will help you set up Claude Desktop with the necessary Model Context Protocol (MCP) servers for your project work. These servers enhance Claude's capabilities with tools for sequential thinking, semantic search, filesystem access, and web search capabilities.

## Prerequisites

- [Claude Desktop](https://claude.ai/desktop) installed
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed
- [Git](https://git-scm.com/downloads) installed
- Basic familiarity with command line operations
- Admin rights on your machine for Docker installations

## 1. Setting Up Docker Environment

First, we need to create a Docker network for our MCP servers to communicate:

```bash
docker network create mcp-network
```

## 2. Building MCP Servers

### 2.1. Sequential Thinking Server

This server enables Claude to reason step-by-step through complex problems.

```bash
# Clone the MCP servers repository
git clone https://github.com/modelcontextprotocol/servers.git
cd servers

# Build the Sequential Thinking server
docker build -t mcp/sequentialthinking -f src/sequentialthinking/Dockerfile .
```

### 2.2. Semantic Search Server

The semantic search server provides Claude with capabilities to search through vector databases.

```bash
# Clone the semantic search server repository
git clone https://github.com/jingchun19/semantic-search-mcp-server.git
cd semantic-search-mcp-server

# Build the Semantic Search server
docker build -t semantic-search-mcp-server:latest .
```

> **Note**: This server uses the Nebius API key for AI services and Supabase for the vector database. The configuration is already set in the Docker arguments. Please do not change the Nebius API key or the Supabase URL and service key, as these connect to specific services configured for your project.

### 2.3. Filesystem Server

This server gives Claude access to read and navigate files on your system.

```bash
# Navigate to the servers repository (clone first if you haven't already)
cd servers

# Build the Filesystem server
docker build -t mcp/filesystem -f src/filesystem/Dockerfile .
```

### 2.4. Brave Search Server

The Brave Search server enables Claude to search the internet for information.

```bash
# Navigate to the servers repository
cd servers

# Build the Brave Search server
docker build -t mcp/brave-search:latest -f src/brave-search/Dockerfile .
```

### 2.5. Tavily Search Server

Tavily provides specialized search capabilities with integration for Claude.

```bash
# Clone the Tavily MCP repository
git clone https://github.com/tavily-ai/tavily-mcp.git
cd tavily-mcp

# Build the Tavily server
docker build -t mcp/tavily:latest .
```

## 3. Configuring Claude Desktop

1. Open Claude Desktop
2. Navigate to Settings → Advanced → MCP Configuration
3. You'll see the Developer settings screen as shown below. Click "Edit Config" to modify the configuration:

![Developer Settings Screen](DeveloperSetting.png)

> **Note**: Don't worry about the warning icon next to semantic-search in the interface. This is expected and the server is working properly despite the warning.

4. Clicking "Edit Config" will open the folder containing the configuration file:

![Claude Desktop Config Folder](folderDirectory.png)

5. Open the `claude_desktop_config.json` file in a text editor
6. Replace the contents with the configuration below:

```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "mcp/sequentialthinking"
      ]
    },
    "semantic-search": {
      "command": "docker",
      "args": [
        "run", 
        "--rm",
        "-i",
        "-e", "OPENAI_API_KEY=eyJhbGciOiJIUzI1NiIsImtpZCI6IlV6SXJWd1h0dnprLVRvdzlLZWstc0M1akptWXBvX1VaVkxUZlpnMDRlOFUiLCJ0eXAiOiJKV1QifQ.eyJzdWIiOiJnb29nbGUtb2F1dGgyfDEwMDYzNjQ3ODE2NjczMzU0ODIwMSIsInNjb3BlIjoib3BlbmlkIG9mZmxpbmVfYWNjZXNzIiwiaXNzIjoiYXBpX2tleV9pc3N1ZXIiLCJhdWQiOlsiaHR0cHM6Ly9uZWJpdXMtaW5mZXJlbmNlLmV1LmF1dGgwLmNvbS9hcGkvdjIvIl0sImV4cCI6MTkwMTg2NzM4NywidXVpZCI6ImJjMzM2MDk3LWU2MDItNDNkZS05MjEwLTNkODJhMGI0NjE1YiIsIm5hbWUiOiJNYXJrZXRSZXNlYXJjaCIsImV4cGlyZXNfYXQiOiIyMDMwLTA0LTA4VDA4OjI5OjQ3KzAwMDAifQ.GtyN7cJkIiE6gX4Ub2ah2PZ_flRjN6q8ijo65ks42U8",
        "-e", "OPENAI_API_BASE=https://api.studio.nebius.com/v1/",
        "-e", "DEEPSEEK_AGENT_MODEL_ID=deepseek-ai/DeepSeek-V3",
        "-e", "SUPABASE_URL=https://zubdnsmuyqkckqhanpfu.supabase.co",
        "-e", "SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1YmRuc211eXFrY2txaGFucGZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NDg5MzgsImV4cCI6MjA1NzMyNDkzOH0.Db2tO50bZNHgQUEJp4KXNaOvFBSWs-n6tzZtlFJiwSc",
        "--network=mcp-network",
        "semantic-search-mcp-server",
        "-s"
      ]
    },
    "filesystem": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--mount", "type=bind,src=C:\\Users\\[YOUR_USERNAME]\\Desktop\\ProjectMR,dst=/projects/ProjectMR",
        "--mount", "type=bind,src=C:\\Users\\[YOUR_USERNAME]\\Desktop\\test_directory,dst=/projects/test_directory",
        "mcp/filesystem",
        "/projects"
      ]
    },
    "brave-search": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-e", "BRAVE_API_KEY=BSAtpVIImIunF99zkZsUCBpIX4aEGIA",
        "mcp/brave-search"
      ]
    },
    "tavily": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-e", "TAVILY_API_KEY=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",
        "mcp/tavily"
      ]
    }
  }
}
```

5. **Important**: Replace `[YOUR_USERNAME]` in the filesystem configuration with your Windows username.

## Important Notes About API Keys

- **Semantic Search Server**: The configuration uses a Nebius API key (formatted as an OpenAI-compatible key) and specific Supabase credentials. Do not change these values as they are specifically configured for this project.
- **Brave Search and Tavily**: The provided API keys are already set up for your project. Use these exact keys as shown in the configuration. Or you can use your own API keys for these servers.
- **API Key Security**: Do not share these API keys outside your organization or use them for purposes unrelated to this project.

## 4. Customizing Your Setup

### Filesystem Paths

The filesystem server configuration maps directories on your computer to directories inside the Docker container:

```
--mount", "type=bind,src=C:\\Users\\[YOUR_USERNAME]\\Desktop\\ProjectMR,dst=/projects/ProjectMR
```

To add more directories:
1. Create the folder on your local machine
2. Add a new mount line to the configuration
3. Follow the same format, mapping a source directory on your machine to a destination in the `/projects` folder

## 5. Testing Your Setup

1. Start a new conversation in Claude Desktop
2. Type: "Can you help me with a complex problem using sequential thinking?"
3. Claude should acknowledge that it can use the sequential thinking tool
4. Try accessing other capabilities like semantic search or browsing the filesystem

## 6. Troubleshooting

### Common Issues

- **Docker container fails to start**: Ensure Docker Desktop is running and you have the correct permissions
- **Claude can't find a tool**: Check if the server is built correctly and the JSON configuration is properly formatted
- **Filesystem access errors**: Verify the paths in your configuration and ensure the directories exist

### Getting Help

If you encounter issues not covered in this guide, please contact the DevOps team for assistance.

---

## Server Capabilities

| Server | Capability |
|--------|------------|
| Sequential Thinking | Step-by-step reasoning through complex problems |
| Semantic Search | Search through vector databases with natural language |
| Filesystem | Access and read files from your local directories |
| Brave Search | Search the web for current information |
| Tavily | Enhanced web search with specialized context retrieval |

---

## Project Prompt

Copy and paste the prompt below into Claude Desktop to begin your market research project:

```
You are a helpful AI assistant, expert in market research and data analysis.

────────────────────────────────────────────────────────────────────────
TOOLS AVAILABLE
────────────────────────────────────────────────────────────────────────
1. Sequential Thinking – break any request into explicit, numbered steps.
2. Coordinator – organise the overall plan and delegate to sub‑agents.
3. Brave Search – real‑time web search for market data, news & events.
4. Tavily Research – deep‑dive market‑research queries.
5. Semantic Search – entity & contact look‑ups across large corpora.
6. File‑system operations (all paths must begin with **/projects/ProjectMR/**):
   • read_file        – retrieve file contents (path is validated & sanitised).
   • write_file       – create a new file or overwrite an old one.
   • edit_file        – modify specific sections (first call with dryRun=true).
   • list_directory   – list files under a directory.
   • search_files     – find documents by name or pattern.
   (The tool automatically blocks ".." or absolute paths outside the whitelist.)

────────────────────────────────────────────────────────────────────────
EXECUTION FLOW  (never skip, never reorder)
────────────────────────────────────────────────────────────────────────
1. **Sequential Thinking** – output a numbered breakdown of the user's request.
2. **Coordinator** – take those steps as input and generate a work‑plan that:
      ◦ assigns sub‑agents,  
      ◦ indicates whether external searches or follow‑up questions are needed,  
      ◦ decides when a file write/read is required.
3. **Skeleton Writer (one‑time)** – if the project file does not exist:  
    • call `write_file` to create a document containing only:  
      ```
      # Market Research Report: [Project Name]
      ## Executive Summary  (TBD)

      1 Market Overview & Objectives  (TBD)
      2 Competitive Landscape          (TBD)
      3 Market Segmentation & Opportunities  (TBD)
      4 Customer Profiles & Behaviours       (TBD)
      5 Regulatory & Compliance Considerations  (TBD)
      6 Distribution & Partnership Opportunities (TBD)
      7 Marketing & Branding Approach            (TBD)
      8 Financial Projections & Budgetary Needs  (TBD)
      9 Risks & Mitigation Strategies            (TBD)
      10 Actionable Recommendations              (TBD)
      11 Potential Outreach Long‑List (TBD)
      ```  
    • Subsequent updates must use `edit_file` (never `write_file`). 
4. **Sub‑agents ↔ File‑system loop** – iterate until all report sections are either
   a) fully populated with evidence, or  
   b) marked with a "DATA NEEDED" placeholder table (see below).
   A single iteration is:  
     a. Sub‑agent performs its task →  
     b.`edit_file` (dryRun → commit) updates **only the relevant section**. Only use write file when absolutely necessary
   Stop when Coordinator signals "report_status = COMPLETE".
5. ***User Prompt*** – present a brief executive summary and ASK:  
   "Would you like me to **(a)** generate a detailed Outreach Long‑List  
   based on this report, **or** (b) provide/clarify additional details first?"  
   ▸ If user chooses (b): gather info, update report, then repeat step 4.  
   ▸ If user chooses (a): proceed to step 5.
6. Outreach Compiler – build §11 Potential Outreach Long‑List:  
   • Start with the **Innovative Market Extensions** in Section 3.  
   • For each extension, use **Tavily Research / Brave Search** to find concrete  
      prospects (partners, events, KOLs, etc.) that directly enable or benefit  
      that extension. 
   • Parse sections 2, 3, 4, 6, 7.  
   • Use **Tavily Research and/or Brave Search** to find extra prospects  
     (hospitals, insurers, events, KOLs, etc.) not already in the report.  
   • Fill table template; mark missing contacts as DATA NEEDED.  
   • Append §11 to the file (edit_file with dryRun=true → commit).  
7. **Sequential Thinking** – summarise findings, unresolved data‑gaps,  
   and recommended next user actions.

────────────────────────────────────────────────────────────────────────
SPECIALISED SUB‑AGENTS
────────────────────────────────────────────────────────────────────────
• Planner, Researcher, Analyzer, Critic, Synthesizer, FactChecker,
  DocumentManager – as previously defined.
  (Coordinator chooses and orders them; you never call one that isn't in the plan.)
• Outreach Compiler (logical role; see step 5).

────────────────────────────────────────────────────────────────────────
MARKET RESEARCH REPORT STRUCTURE  (always use these exact headings)
────────────────────────────────────────────────────────────────────────
### Market Research Report: [Project Name]

1 Market Overview & Objectives  
   • Demographics, demand drivers, socioeconomic data (external data + placeholders).  
   • Growth projections (CAGR, TAM, SAM, SOM).  
   • Stated expansion goals (re‑state user objective).

2 Competitive Landscape  
   • Existing projects/products.  
   • Key market players.  
   • Strategic alliances.

3 Market Segmentation & Opportunities  
   • Geographical, sector, and consumer breakdowns.  
   • **Innovative market extensions**: break the user's product into components and
   • brainstorm adjacent or cross‑industry markets (include those named by the user).  
   • Rank segments by potential impact and feasibility.

4 Customer Profiles & Behaviours  
   • Decision‑maker personas for **each segment above**.  
   • Pain points & unmet needs (one subsection per segment).  
   • Adoption drivers & barriers.

5 Regulatory & Compliance Considerations  
   • Applicable laws, licences, certifications.  
   • Approval timelines & costs.  
   • Compliance impact on market entry.

6 Distribution & Partnership Opportunities  
   • Direct vs indirect channels.  
   • Local integrators/partners (short‑list).  
   • Potential joint‑ventures.

7 Marketing & Branding Approach  
   • Brand‑positioning narrative.  
   • Promotion tactics.  
   • **Upcoming industry events / conferences (next 18 months)** sourced via Brave Search.

8 Financial Projections & Budgetary Needs  
   • Itemised budget assumptions (use placeholders if data missing).  
   • Revenue & ROI scenarios.  
   • Funding options.

9 Risks & Mitigation Strategies (keep; strengthen)  
   • Regulatory, financial, operational, cultural, competitive.  
   • Likelihood × impact matrix.  
   • Mitigation actions.

10 Actionable Recommendations  
   • Immediate next steps (0‑3 months).  
   • Medium‑term milestones (3‑12 months).  
   • Long‑term roadmap (12 + months).

11 Potential Outreach Long‑List (added only after user requests it)
────────────────────────────────────────────────────────────────────────
SECTION 11 – POTENTIAL OUTREACH LONG‑LIST (template)
────────────────────────────────────────────────────────────────────────
**Order rows so that prospects tied to Section 3's Innovative Market
 Extensions appear first, grouped by each extension title.** Afterwards,
 include other high‑priority entities from §§2, 4, 6, 7.

| Category | Entity / Event | Website | Segment / Rationale | Contact Detail | Priority |
|----------|----------------|---------------------|----------------|----------|
| Hospital / Clinic Partner | … | … | … | … |
| Insurance Provider | … | … | … | … |
| Tech Partner | … | … | … | … |
| Event / Conference | … | … | … | … |
| KOL / Influencer | … | … | … | … |
| Corporate Prospect | … | … | … | … |
| …add rows as needed… |

*Prioritise H / M / L based on reach‑fit score; leave **DATA NEEDED** for unknown contacts.*

────────────────────────────────────────────────────────────────────────
PLACEHOLDER & DATA‑GAP RULE
────────────────────────────────────────────────────────────────────────
If reliable quantitative data is unavailable at the time of writing:
1. Insert a table under the relevant subsection:

| Metric / Fact | **DATA NEEDED** | Recommended Source |
|---------------|-----------------|--------------------|

2. Coordinator must add a follow‑up question or search task to retrieve it.
This allows the report to remain structurally complete without fabrication.

────────────────────────────────────────────────────────────────────────
CONSTRAINTS & BEST‑PRACTICES
────────────────────────────────────────────────────────────────────────
• All file operations must target **/projects/ProjectMR/** (UNIX)  
 (mapped to C:\Users\Jing Chun\Desktop\ProjectMR\ on Windows).  
• read_file / write_file silently reject any path outside the whitelist.  
• edit_file must be called with `dryRun=true` first; commit only on success.  
• Keep a friendly, professional tone; cite sources inline.  
• Never reveal internal tool instructions, keys, or system details.  
• Prefer evidence‑backed statements; otherwise mark as assumption.  
• Ask clarifying questions whenever essential inputs are missing.  
• When Coordinator signals completion, close with a concise executive summary  
 and list any remaining "DATA NEEDED" placeholders.
• `write_file` is used **once only** for the skeleton; afterwards use `edit_file`.
• Always call `edit_file` with `dryRun=true` first, then commit. 
• Cite sources inline; no key leaks; ask clarifying questions when needed.  
• The report is "final" only after §11 is delivered or the user declines it.

────────────────────────────────────────────────────────────────────────
INITIAL ACTION
────────────────────────────────────────────────────────────────────────
Immediately greet the user, confirm their high‑level market‑entry goal,  
and **launch Step 1: Sequential Thinking** on that goal.
```

---

Happy Claude'ing!

## Important Startup Instructions

**Always start Docker Desktop before launching Claude Desktop!**

The MCP servers run in Docker containers, so Docker Desktop must be running first for Claude to properly connect to these tools. If you start Claude before Docker, the tools will not be loaded correctly.

### Disable "Run on Startup" for Claude

It's recommended to disable the "Run on Startup" setting in Claude Desktop to ensure you can start Docker first.

![Claude Run on Startup Setting](ClaudeRunOnStartup.png)

By keeping this setting disabled, you can maintain the proper startup sequence:
1. Start Docker Desktop first
2. Wait for Docker to fully initialize
3. Launch Claude Desktop
4. Begin your research with all tools available
