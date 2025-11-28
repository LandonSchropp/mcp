import { inferBaseBranch } from "../commands/git.js";
import { TEMPLATES_DIRECTORY } from "../constants.js";
import { PLANS_DIRECTORY } from "../env.js";
import { server } from "../server-instance.js";
import { renderTemplate } from "../templates/render.js";
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
  "create_plan_template",
  {
    title: "create_plan_template",
    description: "Creates an plan template",
    inputSchema: {
      title: z.string().describe("The title of the plan"),
      type: z.enum(TEMPLATE_NAMES).describe("The type of plan to create"),
      featureBranch: z.string().describe("The branch the plan will be implemented on"),
      baseBranch: z.string().optional().describe("The base branch for the feature branch"),
      linearIssueId: z.string().optional().describe("The Linear issue associated with the plan"),
    },
  },
  async ({ title, type, featureBranch, baseBranch, linearIssueId }) => {
    // Determine the paths
    let timestamp = format(new Date(), "yyyy-MM-dd_HH-mm-ss");
    let templatePath = join(TEMPLATES_DIRECTORY, "plan", `${type}.md`);
    let planPath = resolve(join(PLANS_DIRECTORY, featureBranch, `${timestamp}_${type}.md`));
    let planDirectory = dirname(planPath);

    // Generate the plan content
    let template = await readFile(templatePath, "utf-8");
    let content = renderTemplate(template, {
      title,
      featureBranch,
      baseBranch: baseBranch ?? (await inferBaseBranch(featureBranch)),
      linearIssueId,
    });

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
