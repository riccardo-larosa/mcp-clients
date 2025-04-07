// src/client.ts

// Corrected SDK imports - REMOVE ToolCallResult if it's not there
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { config } from 'dotenv';
// Removed ToolCallResult import if it caused errors

// Load environment variables from .env file
config();

// --- Configuration ---
const serverCommand = process.env.MCP_SERVER_COMMAND;
const epBaseUrl = process.env.EP_BASE_URL;
const epAccessToken = process.env.EP_ACCESS_TOKEN;

// --- Define a type alias for the expected tool result structure ---
// This represents the object returned inside the 'result' field of the JSON-RPC response
type McpToolSuccessResult = {
  _meta?: { [key: string]: unknown };
  name: string;
  arguments?: { [key: string]: unknown };
  content: Array<McpContentItem>;
};

// Define a type for the content items (can be expanded)
// Use a simple base or a discriminated union if needed
type McpContentItem =
    | { type: "text"; text: string }
    | { type: "uri"; uri: string; mimeType?: string }
    // Add other potential types based on spec or server behavior
    | { type: string; [key: string]: any }; // Fallback for unknown types

// --- Main Client Logic ---
async function main() {
  console.log("Starting MCP Client (Stdio)...");

  // --- Validate Configuration ---
  if (!serverCommand) {
    console.error("Error: MCP_SERVER_COMMAND environment variable is not set.");
    console.error("Please set it to the command needed to run the server, e.g., 'node ../mcp-ep-server/dist/index.js'");
    process.exit(1);
  }
  if (!epBaseUrl) {
    console.error("Error: EP_BASE_URL environment variable is not set.");
    process.exit(1);
  }
  if (!epAccessToken) {
    console.error("Error: EP_ACCESS_TOKEN environment variable is not set.");
    process.exit(1);
  }
  console.log(`Launching MCP Server with command: ${serverCommand}`);
  console.log(`Using Elastic Path Base URL: ${epBaseUrl}`);

  let client: Client | null = null;

  try {
    const transport = new StdioClientTransport({
      command: serverCommand,
      args: []
    });
    client = new Client({ name: "mcp-client-cli", version: "1.0.0" });

    console.log("Connecting to server (launching subprocess)...");
    await client.connect(transport);
    console.log("Successfully connected and initialized!");

    // --- Display Server Info & Available Tools ---
    // (This part remains the same)
    if (client.getServerCapabilities()) {
        console.log("\n--- Server Information ---");
        // console.log(`Name: ${client.getServerCapabilities().name}`);
        // console.log(`Version: ${client.getServerCapabilities().version}`);
        // console.log(`Description: ${client.getServerCapabilities().description || 'N/A'}`);

        const tools = client.getServerCapabilities()?.tools || {};
        const toolNames = Object.keys(tools);

        if (toolNames.length > 0) {
            console.log("\n--- Available Tools ---");
            toolNames.forEach(toolName => {
            console.log(`- ${toolName}`);
            });
        } else {
            console.log("\nNo tools reported by the server.");
        }
    } else {
        console.warn("Could not retrieve server information after connection.");
    }


    // --- Example: Call the 'listFiles' Tool ---
    console.log("\n--- Calling 'listFiles' tool ---");

    const listFilesParams = {
      baseUrl: epBaseUrl,
      accessToken: epAccessToken,
      limit: 5
    };

    try {
      // **CHANGE:** Use the locally defined type or allow inference.
      // The 'callTool' method returns the 'result' field's content directly.
      const result = await client.callTool({
        name: "listFiles",
        arguments: listFilesParams
      });

      console.log("\n'listFiles' Tool Result:");

      // Access result.content directly
      if (result && result.content && Array.isArray(result.content)) {
         result.content.forEach((item: McpContentItem, index: number) => {
            console.log(`Content Item ${index + 1} (Type: ${item.type}):`);
            if (item.type === 'text') {
              console.log(item.text);
            } else if (item.type === 'uri') {
              console.log(`URI: ${item.uri} (MIME Type: ${item.mimeType || 'unknown'})`);
            } else {
              // Print the raw item if type is unknown/other
              console.log(JSON.stringify(item, null, 2));
            }
         });
      } else {
          console.log("Received unexpected result format:", JSON.stringify(result, null, 2));
      }

    } catch (toolError: any) { // Catch as 'any' or 'unknown' for broader error handling
      console.error("\nError calling 'listFiles' tool:");
      // Check if it resembles a JSON-RPC Error object
      if (toolError && typeof toolError === 'object' && 'code' in toolError && 'message' in toolError) {
         console.error(`  Code: ${toolError.code}`);
         console.error(`  Message: ${toolError.message}`);
         if ('data' in toolError) {
            console.error(`  Data: ${JSON.stringify(toolError.data)}`);
         }
      } else {
         // Log as a general error if it doesn't fit the JSON-RPC error structure
         console.error(toolError);
      }
    }

    // --- Add calls to other tools here as needed ---

  } catch (error) {
    console.error("\nAn error occurred during client operation:", error);
  } finally {
    // --- Disconnect ---
    if (client) {
      console.log("\nDisconnecting from server (terminating subprocess)...");
      await client.close();
      console.log("Disconnected.");
    } else {
        console.log("\nClient was not connected or already disconnected.");
    }
  }
}

// Run the main function
main().catch(err => {
  console.error("Unhandled error in main function:", err);
  process.exit(1);
});