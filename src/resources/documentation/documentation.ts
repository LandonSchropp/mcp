import { server } from "../../server-instance.js";
import { first } from "../../utilities/array.js";
import { fetchDocumentationResources, readDocumentation } from "./resources.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";

// Include all of the documentation files as resources in the MCP server.
server.registerResource(
  "documentation",
  new ResourceTemplate(`doc://{+path}`, {
    list: async () => ({ resources: await fetchDocumentationResources() }),
  }),
  {
    title: "Documentation",
    description: "A collection of documentation files",
  },
  async (uri, { path }) => {
    return {
      contents: [
        {
          uri: uri.href,
          text: await readDocumentation(first(path)),
        },
      ],
    };
  },
);
