import { RouteOptions } from "fastify";
import {
  DeprecationPlugin,
  DeprecationPluginOptions,
  ExtendedSchema,
} from "./types";
import fp from "fastify-plugin";

const PLUGIN_DEFAULTS = {
  deprecationMessage:
    "This route is deprecated and may be removed in the future.",
  logDeprecationAccess: true,
  rejectAfterDeprecation: false,
  setDeprecatedInSchema: true,
} as const satisfies DeprecationPluginOptions;

const deprecationPlugin: DeprecationPlugin = (fastify, options, done) => {
  const {
    deprecatedRoutes = [],
    deprecationMessage,
    logDeprecationAccess,
    rejectAfterDeprecation,
    setDeprecatedInSchema,
  } = { ...PLUGIN_DEFAULTS, ...options };

  // Handle specific globally-deprecated routes
  fastify.addHook("onRequest", (request, reply, done) => {
    const route = deprecatedRoutes.find((r) => r.path === request.url);
    if (route) {
      const currentDate = new Date();
      const deprecationDate = route.deprecationDate
        ? new Date(route.deprecationDate)
        : null;

      // Determine if logging access to this route is enabled
      const shouldLogAccess =
        route.logDeprecationAccess ?? logDeprecationAccess;
      if (shouldLogAccess) {
        fastify.log.warn(
          `Deprecated route accessed: ${request.url}. ${route.deprecationDate ? `Deprecation date: ${deprecationDate?.toISOString()}.` : ""} ${route.alternate ? `Consider using alternate route: ${route.alternate}.` : ""}`,
        );
      }

      // If an alternate route is provided, include it in the response
      const optionalNewRoute = route.alternate
        ? ` Please use ${route.alternate} instead.`
        : "";

      reply.header("Deprecation", route.deprecationDate || "true");
      if (route.alternate) {
        reply.header(
          "Link",
          `<${route.alternate}>; rel="alternate,deprecated"`,
        );
      }

      // Determine if we should reject routes after the deprecation date
      const shouldRejectAfterDeprecation =
        route.rejectAfterDeprecation ?? rejectAfterDeprecation;
      if (
        shouldRejectAfterDeprecation &&
        deprecationDate &&
        currentDate > deprecationDate
      ) {
        reply.status(410).send({
          error: "Gone",
          message: `This route has been deprecated as of ${deprecationDate.toISOString()} and is no longer available.${optionalNewRoute}`,
        });
        return;
      }
    }
    done();
  });

  const getOrCreateSchema = (routeOptions: RouteOptions): ExtendedSchema => {
    return (routeOptions.schema as ExtendedSchema) || {};
  };

  // Register routes with modified schema to mark them as deprecated
  fastify.addHook("onRoute", (routeOptions: RouteOptions) => {
    const deprecatedRoute = deprecatedRoutes.find(
      (r) => r.path === routeOptions.url,
    );

    if (!deprecatedRoute) return; // Skip if route is not deprecated
    if (!setDeprecatedInSchema) return; // Skip if we don't want to set deprecated in schema

    const schema = getOrCreateSchema(routeOptions);

    schema.deprecated = true;

    let generatedMessage = deprecatedRoute.deprecationDate
      ? `This route will be deprecated on ${new Date(deprecatedRoute.deprecationDate).toISOString().split("T")[0]} and removed in the future.`
      : deprecationMessage;

    if (deprecatedRoute.alternate) {
      generatedMessage += ` Please use ${deprecatedRoute.alternate} instead.`;

      schema.externalDocs = {
        description: "Refer to the alternate route for more details.",
        url: deprecatedRoute.alternate,
      };
    }

    schema.description = `${generatedMessage}${schema.description ? `\n\n${schema.description}` : ""}`;

    routeOptions.schema = schema;
  });

  done();
};

export default fp(deprecationPlugin, {
  name: "fastify-deprecation-plugin",
  fastify: "5.x",
});
