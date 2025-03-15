/* eslint-disable */
// @ts-nocheck
/**
 * Customer-related tools for the Shopify MCP Server
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ShopifyClient } from "../ShopifyClient/ShopifyClient.js";
import { config } from "../config/index.js";
import { handleError, formatSuccess } from "../utils/errorHandler.js";

// Define input types for better type safety
interface GetCustomersInput {
  limit?: number;
  next?: string;
}

interface TagCustomerInput {
  customerId: string;
  tags: string[];
  accessToken: string;
  shopDomain: string;
}

/**
 * Registers customer-related tools with the MCP server
 * @param server The MCP server instance
 */
export function registerCustomerTools(server: McpServer): void {
  // Get Customers Tool
  server.tool(
    "get-customers",
    "Get shopify customers with pagination support",
    {
      limit: z.number().optional().describe("Maximum number of customers to return"),
      next: z.string().optional().describe("Next page cursor"),
      accessToken: z.string().optional().describe("Shopify access token"),
      shopDomain: z.string().optional().describe("Shopify shop domain"),
    },
    async ({ limit, next, accessToken, shopDomain }: GetCustomersInput) => {
      const client = new ShopifyClient();
      try {
        const customers = await client.loadCustomers(
          config.accessToken,
          config.shopDomain,
          limit,
          next
        );
        return formatSuccess(customers);
      } catch (error) {
        return handleError("Failed to retrieve customers", error);
      }
    }
  );

  // Tag Customer Tool
  server.tool(
    "tag-customer",
    "Add tags to a customer",
    {
      customerId: z.string().describe("Customer ID to tag"),
      tags: z.array(z.string()).describe("Tags to add to the customer"),
      accessToken: z.string().describe("Shopify access token"),
      shopDomain: z.string().describe("Shopify shop domain"),
    },
    async ({ customerId, tags, accessToken, shopDomain }: TagCustomerInput) => {
      const client = new ShopifyClient();
      try {
        const success = await client.tagCustomer(
          accessToken,
          shopDomain,
          tags,
          customerId
        );
        
        if (success) {
          return {
            content: [
              {
                type: "text",
                text: `Successfully tagged customer ${customerId} with tags: ${tags.join(", ")}`,
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `Failed to tag customer ${customerId}`,
              },
            ],
            isError: true,
          };
        }
      } catch (error) {
        return handleError(`Failed to tag customer ${customerId}`, error);
      }
    }
  );
}