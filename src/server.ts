// Import all modules after server is created to avoid circular dependency issues
import "./prompts/index.js";
import "./resources/documentation.js";
import "./resources/pull-request.js";
import "./tools/create-plan-template.js";
import "./tools/fetch-feature-branch.js";
import "./tools/switch-git-branch.js";

// HACK: In order to avoid circular dependency issues due to dynamic imports, we have to use a
// separate file to create the server instance.
//
// https://github.com/nodejs/node/issues/55468
export * from "./server-instance.js";
