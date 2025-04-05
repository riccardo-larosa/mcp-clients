// import { McpClient } from "@modelcontextprotocol/sdk/client/mcp.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { config } from 'dotenv';
// import { ToolCallResult } from "@modelcontextprotocol/sdk/common.js"; // Import type
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
// import {  } from "@modelcontextprotocol/sdk/shared/transport.js";
// Load environment variables from .env file
config();

// --- Configuration ---
const mcpServerUrl = process.env.MCP_SERVER_URL;
const epBaseUrl = process.env.EP_BASE_URL;
const epAccessToken = process.env.EP_ACCESS_TOKEN;

// --- Main Client Logic ---
async function main() {
  console.log("Starting MCP Client...");

  // --- Validate Configuration ---
  if (!mcpServerUrl) {
    console.error("Error: MCP_SERVER_URL environment variable is not set.");
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
  console.log(`Connecting to MCP Server at: ${mcpServerUrl}`);
  console.log(`Using Elastic Path Base URL: ${epBaseUrl}`);

  // --- Create Transport & Client ---
  let client: Client | null = null; // Define client variable outside try block

  try {
    // 1. Create the SSE transport
    const transport = new SSEClientTransport(new URL(mcpServerUrl));

    // 2. Create the MCP client instance
    client = new Client({ name: "mcp-client-cli", version: "1.0.0" });

    // --- Connect and Initialize ---
    console.log("Connecting to server...");
    // The connect method handles the GET request to /sse, establishes the connection,
    // and performs the MCP initialization handshake.
    await client.connect(transport);
    console.log("Successfully connected and initialized!");

    // --- Display Server Info & Available Tools ---
    // if (client.getServerCapabilities()) {
    //   console.log("\n--- Server Information ---");
    //   // console.log(`Name: ${client.getServerCapabilities().name}`);
      // console.log(`Version: ${client.getServerCapabilities().version}`);
      // console.log(`Description: ${client.getServerCapabilities().description || 'N/A'}`);

      // const tools = client.getServerCapabilities()?.tools || {};
      // const toolNames = Object.keys(tools);

      const toolsResult = await client.listTools();
      const tools = toolsResult.tools.map((tool) => {
        return {
          name: tool.name,
          description: tool.description,
          input_schema: tool.inputSchema,
        };
      });
      console.log(
        "Connected to server with tools:",
        tools.map(({ name }) => name)
      );
    // } else {
    //   console.warn("Could not retrieve server information after connection.");
    // }

    // // --- Example: Call the 'listFiles' Tool ---
    // console.log("\n--- Calling 'listFiles' tool ---");

    // const listFilesParams = {
    //   baseUrl: epBaseUrl,         // Required by *our* server tool implementation
    //   accessToken: epAccessToken, // Required by *our* server tool implementation
    //   limit: 5                    // Optional parameter for the listFiles tool itself
    //   // offset: 0                // Another optional parameter
    //   // filter: 'eq(mime_type,"image/png")' // Example filter
    // };

    // try {
    //   const result = await client.callTool("listFiles", listFilesParams);
    //   console.log("\n'listFiles' Tool Result:");
    //   // The result.content is an array, usually with one text item for simple tools
    //   result.content.forEach((item, index) => {
    //     console.log(`Content Item ${index + 1}:`);
    //     if (item.type === 'text') {
    //       console.log(item.text);
    //     } else {
    //       console.log(JSON.stringify(item, null, 2)); // Print other types as JSON
    //     }
    //   });
    // } catch (toolError) {
    //   console.error("\nError calling 'listFiles' tool:", toolError);
    //   // Log specific JSON-RPC error details if available
    //   if (toolError && typeof toolError === 'object' && 'code' in toolError && 'message' in toolError) {
    //      console.error(`  Code: ${toolError.code}`);
    //      console.error(`  Message: ${toolError.message}`);
    //      if ('data' in toolError) {
    //         console.error(`  Data: ${JSON.stringify(toolError.data)}`);
    //      }
    //   }
    // }

    // --- Add calls to other tools here as needed ---
    // Example: Call getFile (replace 'your-file-id' with a real ID)
    /*
    console.log("\n--- Calling 'getFile' tool ---");
    const fileIdToGet = 'your-file-id';
    try {
        const getFileParams = {
            baseUrl: epBaseUrl,
            accessToken: epAccessToken,
            fileId: fileIdToGet
        };
        const result: ToolCallResult = await client.callTool("getFile", getFileParams);
        console.log(`\n'getFile' Tool Result (ID: ${fileIdToGet}):`);
        result.content.forEach((item, index) => {
            console.log(`Content Item ${index + 1}:`);
            if (item.type === 'text') {
                console.log(item.text);
            } else {
                console.log(JSON.stringify(item, null, 2));
            }
        });
    } catch (toolError) {
        console.error(`\nError calling 'getFile' tool (ID: ${fileIdToGet}):`, toolError);
    }
    */


  } catch (error) {
    console.error("\nAn error occurred during client operation:", error);
  } finally {
    // --- Disconnect ---
    if (client) {
      console.log("\nDisconnecting from server...");
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