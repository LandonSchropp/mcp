import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * A function that resolves a parameter's value based on the server context and provided values.
 *
 * @param server The MCP server instance, providing context for resolution.
 * @param prompt The name of the prompt being processed.
 * @param name The name of the parameter to resolve.
 * @param values An object containing all previously resolved parameter values.
 * @returns The resolved parameter value, either synchronously or as a Promise.
 */
export type ParameterResolver = (
  server: McpServer,
  prompt: string,
  name: string,
  values: Record<string, string>,
) => Promise<string> | string;

/**
 * A function that transforms a provided parameter value.
 *
 * @param value The raw value provided for the parameter.
 * @returns The transformed value.
 */
export type ParameterTransform = (value: string) => string;

/** The basic information needed to define a prompt parameter. */
type ParameterDefinitionBase = {
  /** The name of the parameter, as it appears in the prompt template. */
  name: string;

  /** A brief description of the parameter's purpose. */
  description: string;

  /** The type of the parameter: */
  // TODO: Currently, Claude Code does not support sampling. When it does, I'd like to add a
  // `"prompt"` type to support iterative prompting.
  type: "required" | "optional" | "auto";

  /** Optional function to transform the provided value. */
  transform?: ParameterTransform;
};

/** A parameter that must be provided by the user as part of the prompt's arguments. */
type RequiredParameter = ParameterDefinitionBase & {
  type: "required";
};

/**
 * A parameter that may be provided by the user, but will fall back to a value if omitted.
 *
 * NOTE: Currently, there's a bug in Claude Code where it seems to require optional parameters. See:
 * https://github.com/anthropics/claude-code/issues/5597.
 */
type OptionalParameter = ParameterDefinitionBase & {
  type: "optional";

  /** Function to resolve the parameter's value. */
  resolve: ParameterResolver;
};

/** A parameter that will be automatically resolved using a predefined function. */
type AutoParameter = ParameterDefinitionBase & {
  type: "auto";

  /** Function to resolve the parameter's value. */
  resolve: ParameterResolver;
};

/** A prompt parameter definition, including its resolver function. */
export type ParameterDefinition = RequiredParameter | OptionalParameter | AutoParameter;
