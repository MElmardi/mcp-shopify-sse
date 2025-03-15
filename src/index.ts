#!/usr/bin/env node
/* eslint-disable */
// @ts-nocheck
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerCustomerTools } from "./tools/customerTools.js";
import { registerDiscountTools } from "./tools/discountTools.js";
import { registerOrderTools } from "./tools/orderTools.js";
// import { registerProductTools } from "./tools/productTools.js";
import { registerShopTools } from "./tools/shopTools.js";
import { registerWebhookTools } from "./tools/webhookTools.js";
import express from "express";
import { config } from 'dotenv'

config()


const server = new McpServer(
  {
    name: "mcp-shopify",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  },
);

/**
 * Main entry point for the Shopify MCP Server 
 * Initializes the server and registers all tools
 */
async function registerTools() {
  // Create the MCP server

  // Register all tools
  // registerProductTools(server);
  registerCustomerTools(server);
  registerOrderTools(server);
  registerShopTools(server);
  registerDiscountTools(server);
  registerWebhookTools(server);


}

// Start the server
registerTools().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});



async function runServer() {
  const app = express();
  const port = process.env.PORT || 3001;

  // Store active transport
  let activeTransport: SSEServerTransport | null = null;

  app.get("/sse", async (req, res) => {
    // Close existing connection if any
    if (activeTransport) {
      try {
        await activeTransport.close();
      } catch (error) {
        console.warn("Error closing previous transport:", error);
      }
    }

    // Create new transport
    activeTransport = new SSEServerTransport("/messages", res);
    await server.connect(activeTransport);

    // Handle client disconnect
    res.on('close', () => {
      activeTransport = null;
    });
  });

  app.post("/messages", async (req, res) => {
    if (!activeTransport) {
      res.status(400).json({ error: "No active SSE connection" });
      return;
    }
    await activeTransport.handlePostMessage(req, res);
  });

  app.listen(port, () => {
    console.log(`MCP Shopify server listening on port ${port}`);
  });
}

runServer().catch(console.error);
