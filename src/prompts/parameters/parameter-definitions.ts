import { getCurrentBranch, getDefaultBranch } from "../../commands/git";
import { ParameterDefinition, ParameterResolver } from "./types";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

const TARGET_DEFAULT = "the current context";

const LINEAR_ISSUE_ID_REGEX = /[A-Z]{2,}-\d+/;

const transformLinearIssueId = (value: string): string => {
  const match = value.match(LINEAR_ISSUE_ID_REGEX);
  if (match) {
    return match[0];
  }
  throw new McpError(ErrorCode.InvalidParams, "No valid Linear issue ID found");
};

// TODO: When Claude Code supports sampling, we can use it to prompt the user to enter multi-word
// descriptions and convert them to branch names.
const resolveFeatureBranch: ParameterResolver = async () => {
  let currentBranch = await getCurrentBranch();
  let defaultBranch = await getDefaultBranch();

  if (currentBranch === defaultBranch) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `You are currently on the '${defaultBranch}'. Please switch to a feature branch or ` +
        `provide the feature branch as an argument.`,
    );
  }

  return currentBranch;
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
