import { Liquid } from "liquidjs";

export const liquid = new Liquid({
  root: "/",
  relativeReference: true,
  extname: ".md.liquid",
});
