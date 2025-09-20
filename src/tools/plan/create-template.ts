import { TEMPLATES_DIRECTORY } from "../../constants";
import { PLANS_DIRECTORY } from "../../env";
import { server } from "../../server";
import { renderTemplate } from "../../templates/render";
import { format } from "date-fns";
import { readFile } from "fs/promises";
import { mkdir } from "fs/promises";
import { writeFile } from "fs/promises";
import { glob } from "fs/promises";
import { basename, dirname, join, resolve } from "path";
import z from "zod";

const TEMPLATES = await Array.fromAsync(glob(join(TEMPLATES_DIRECTORY, "plan/*.md")));
const TEMPLATE_NAMES = TEMPLATES.map((path) => basename(path, ".md")) as [string, ...string[]];

server.registerTool(
  "plan/create-template",
  {
    title: "plan/create-template",
    description: "Creates an plan template",
    inputSchema: {
      title: z.string(),
      type: z.enum(TEMPLATE_NAMES),
      featureBranch: z.string(),
    },
  },
  async ({ title, type, featureBranch }) => {
    // Determine the paths
    let timestamp = format(new Date(), "yyyy-MM-dd_HH-mm-ss");
    let templatePath = join(TEMPLATES_DIRECTORY, "plan", `${type}.md`);
    let planPath = resolve(join(PLANS_DIRECTORY, featureBranch, `${timestamp}_${type}.md`));
    let planDirectory = dirname(planPath);

    // Generate the plan content
    let template = await readFile(templatePath, "utf-8");
    let content = renderTemplate(template, { title });

    // Write the plan file
    await mkdir(planDirectory, { recursive: true });
    await writeFile(planPath, content, "utf-8");

    return {
      content: [
        {
          type: "resource_link",
          uri: `file://${planPath}`,
          name: basename(planPath),
          mimeType: "text/markdown",
          description: `Generated ${type} plan template file`,
        },
      ],
    };
  },
);
