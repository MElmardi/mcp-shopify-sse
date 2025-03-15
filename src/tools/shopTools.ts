/* eslint-disable */
// @ts-nocheck

/**
 * Shop and collection related tools for the Shopify MCP Server
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ShopifyClient } from "../ShopifyClient/ShopifyClient.js";
import { config } from "../config/index.js";
import { handleError, formatSuccess } from "../utils/errorHandler.js";

// Define input types for better type safety
interface GetCollectionsInput {
  limit?: number;
  name?: string;
  accessToken: string;
  shopDomain: string;
}

/**
 * Registers shop and collection related tools with the MCP server
 * @param server The MCP server instance
 */
export function registerShopTools(server: McpServer): void {
  // Get Collections Tool
  server.tool(
    "get-collections",
    "Get all collections",
    {
      limit: z
        .number()
        .optional()
        .default(10)
        .describe("Maximum number of collections to return"),
      name: z.string().optional().describe("Filter collections by name"),
      accessToken: z.string().describe("Shopify access token"),
      shopDomain: z.string().describe("Shopify shop domain"),
    },
    async ({ limit, name, accessToken, shopDomain }: GetCollectionsInput) => {
      const client = new ShopifyClient();
      try {
        const collections = await client.loadCollections(
          accessToken,
          shopDomain,
          { limit, name }
        );
        return formatSuccess(collections);
      } catch (error) {
        return handleError("Failed to retrieve collections", error);
      }
    }
  );

  // Get Shop Tool
  server.tool(
    "get-shop",
    "Get shop details",
    {
      accessToken: z.string().describe("Shopify access token"),
      shopDomain: z.string().describe("Shopify shop domain"),
    },
    async ({ accessToken, shopDomain }) => {
      const client = new ShopifyClient();
      try {
        const shop = await client.loadShop(
          accessToken,
          shopDomain
        );
        return formatSuccess(shop);
      } catch (error) {
        return handleError("Failed to retrieve shop details", error);
      }
    }
  );

  // Get Shop Details Tool
  server.tool(
    "get-shop-details",
    "Get extended shop details including shipping countries",
    {
      accessToken: z.string().describe("Shopify access token"),
      shopDomain: z.string().describe("Shopify shop domain"),
    },
    async ({ accessToken, shopDomain }) => {
      const client = new ShopifyClient();
      try {
        const shopDetails = await client.loadShopDetail(
          accessToken,
          shopDomain
        );
        return formatSuccess(shopDetails);
      } catch (error) {
        return handleError("Failed to retrieve extended shop details", error);
      }
    }
  );
}