// Import all modules after server is created to avoid circular dependency issues
import "./prompts";
import "./resources/documentation";
import "./resources/feature-branch";
import "./resources/pull-request";
import "./tools/switch-git-branch";
import "./tools/create-plan-template";

// HACK: In order to avoid circular dependency issues due to dynamic imports, we have to use a
// separate file to create the server instance.
//
// https://github.com/nodejs/node/issues/55468
export * from "./server-instance";
