import Handlebars from "handlebars";

/** Global Handlebars instance with all registered helpers. */
export const handlebars = Handlebars.create();

await import("./documentation.ts");
