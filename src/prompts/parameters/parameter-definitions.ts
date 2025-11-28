import { getCurrentBranch, getDefaultBranch } from "../../commands/git.js";
import { ParameterDefinition } from "./types.js";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

const LINEAR_ISSUE_ID_REGEX = /[A-Z]{2,}-\d+/;

const transformLinearIssueId = (value: string): string => {
  const match = value.match(LINEAR_ISSUE_ID_REGEX);
  if (match) {
    return match[0];
  }
  throw new McpError(ErrorCode.InvalidParams, "No valid Linear issue ID found");
};

// TODO: Add back description parameter when Claude Code supports sampling. When sampling is
// available, we can use it to prompt the user to enter multi-word descriptions.
// See: https://github.com/anthropics/claude-code/issues/1785

/** List of allowed parameters and their resolvers */
export const PARAMETER_DEFINTIONS: ParameterDefinition[] = [
  {
    name: "linearIssueId",
    description: "Linear issue ID (e.g. AB-123)",
    type: "required",
    transform: transformLinearIssueId,
  },
  {
    name: "currentBranch",
    description: "The name of the current Git branch",
    type: "auto",
    resolve: getCurrentBranch,
  },
  {
    name: "defaultBranch",
    description: "The default branch for the repository",
    type: "auto",
    resolve: getDefaultBranch,
  },
];
