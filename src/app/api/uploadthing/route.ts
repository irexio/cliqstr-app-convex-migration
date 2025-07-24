import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

export const dynamic = 'force-dynamic';

// Create and export the route handlers
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
