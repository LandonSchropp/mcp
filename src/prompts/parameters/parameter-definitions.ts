import { claude } from "../../commands/claude";
import { ParameterDefinition, ParameterResolver } from "./types";

const TARGET_DEFAULT = "the current context";
const DESCRIPTION_DEFAULT = "the task in the current context";

const BRANCH_PRINT_INSTRUCTION = "Print the branch name and nothing else.";

const LINEAR_ISSUE_ID_REGEX = /[A-Z]{2,}-\d+/;

const resolveFeatureBranch: ParameterResolver = async (
  _server: any,
  _prompt: string,
  _name: string,
  values: Record<string, string>,
) => {
  let description = values["description"];

  if (!description?.trim()) {
    throw new Error("Cannot resolve featureBranch without a description");
  }

  let issueIdMatch = description.match(LINEAR_ISSUE_ID_REGEX);

  if (issueIdMatch) {
    return await claude(
      `Fetch ${issueIdMatch[0]} using the Linear MCP get_issue resource. ${BRANCH_PRINT_INSTRUCTION}`,
    );
  }

  let result = await claude(
    `Create a simple branch name in a few words in kebab case based on the following description: 

    ${description}

    ${BRANCH_PRINT_INSTRUCTION}`,
  );

  return result;
};

/** List of allowed parameters and their resolvers */
export const PARAMETER_DEFINTIONS: ParameterDefinition[] = [
  {
    name: "target",
    description: "Target (path, description, reference, etc.)",
    type: "optional",
    resolve: () => TARGET_DEFAULT,
  },
  {
    name: "description",
    description: "A description of the task",
    type: "optional",
    resolve: () => DESCRIPTION_DEFAULT,
  },
  {
    name: "featureBranch",
    description: "The name of the feature branch",
    type: "auto",
    resolve: resolveFeatureBranch,
  },
];
