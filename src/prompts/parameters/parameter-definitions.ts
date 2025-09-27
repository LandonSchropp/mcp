import { claude } from "../../commands/claude";
import { getCurrentBranch } from "../../commands/git";
import { ParameterDefinition, ParameterResolver } from "./types";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

const TARGET_DEFAULT = "the current context";

const BRANCH_PRINT_INSTRUCTION = "Print the branch name and nothing else.";

const LINEAR_ISSUE_ID_REGEX = /[A-Z]{2,}-\d+/;

const transformLinearIssueId = (value: string): string => {
  const match = value.match(LINEAR_ISSUE_ID_REGEX);
  if (match) {
    return match[0];
  }
  throw new McpError(ErrorCode.InvalidParams, "No valid Linear issue ID found");
};

const resolveFeatureBranch: ParameterResolver = async (
  _server: any,
  _prompt: string,
  _name: string,
  values: Record<string, string>,
) => {
  return await claude(
    `Create a simple branch name in a few words in kebab case for this ${_prompt} task. ${BRANCH_PRINT_INSTRUCTION}`,
  );
};

// TODO: Add back description parameter when Claude Code supports sampling. When sampling is
// available, we can use it to prompt the user to enter multi-word descriptions.
// See: https://github.com/anthropics/claude-code/issues/1785

/** List of allowed parameters and their resolvers */
export const PARAMETER_DEFINTIONS: ParameterDefinition[] = [
  {
    name: "target",
    description: "Target (path, description, reference, etc.)",
    type: "optional",
    resolve: () => TARGET_DEFAULT,
  },
  {
    name: "linearIssueId",
    description: "Linear issue ID (e.g. AB-123)",
    type: "required",
    transform: transformLinearIssueId,
  },
  {
    name: "featureBranch",
    description: "The name of the feature branch",
    type: "auto",
    resolve: resolveFeatureBranch,
  },
  {
    name: "currentBranch",
    description: "The name of the current Git branch",
    type: "auto",
    resolve: getCurrentBranch,
  },
];
