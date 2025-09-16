import { handlebars } from "./index.ts";

handlebars.registerHelper("documentation", function (path: string, options: any) {
  // TODO: Implement documentation loading
  return `Documentation for ${path}#${options.hash.section}`;
});
