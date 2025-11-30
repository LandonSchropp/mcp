import { server } from "../../server-instance.js";
import { fetchDocumentationResources, readDocumentationResource } from "./resources.js";

const COLLECTION_RESOURCES = [
  {
    name: "test",
    title: "Test Guidelines",
    description: "Guidelines for writing tests, combining Better Tests with my preferences",
    uri: "doc://test",
  },
  {
    name: "spec",
    title: "Spec Guidelines",
    description: "Guidelines for writing specs, combining Better Specs with my preferences",
    uri: "doc://spec",
  },
  {
    name: "writing",
    title: "Writing Guidelines",
    description: "Guidelines for writing, including format, voice, and improvement tips",
    uri: "doc://writing",
  },
] as const;

// Register "collection" resources for specific documentation prefixes
for (let { name, title, description, uri } of COLLECTION_RESOURCES) {
  server.registerResource(name, uri, { title, description }, async () => {
    return {
      contents: await Promise.all(
        (await fetchDocumentationResources())
          .filter((resource) => resource.uri.startsWith(uri))
          .map(readDocumentationResource),
      ),
    };
  });
}
