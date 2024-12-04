import { FastifyPluginCallback, FastifySchema } from "fastify";

/**
 * Fastify Deprecation Plugin
 *
 * Fastify plugin to deprecate routes and log access to deprecated routes.
 */
export type DeprecationPlugin = FastifyPluginCallback<DeprecationPluginOptions>;

/**
 * ## Deprecation Route
 *
 * Route that is deprecated.
 */
export type DeprecatedRoute = {
  /**
   * ## Path
   * Path to the route that is deprecated. */
  path: string;
  /**
   * ### Deprecation Date
   * Date when the route will take effect.
   *
   * If this option is not set, the plugin will use the default deprecation message without a specific date.
   */
  deprecationDate?: string;
  /**
   * Alternate route to use instead of the deprecated route.
   *
   * If this option is not set, the plugin **will not add the `Link` header**. It will also **not add the `externalDocs` property** to the OpenAPI schema.
   */
  alternate?: string;
  /**
   * ### Reject After Deprecation
   * This option is used to determine if the route should be rejected after the deprecation date.
   * By default, the plugin will not reject routes after the deprecation date.
   *
   * **Note**: This option **will override the global option** if set for this specific route.
   *
   * If set to `true`, the route will be rejected with a `410 status code` after the deprecation date.
   */
  rejectAfterDeprecation?: boolean;
  /**
   * ## Log Deprecation Access
   * This option is used to determine if the plugin should log access to deprecated route.
   * By default, the plugin will log access to deprecated route.
   *
   * **Note**: This option **will override the global option** if set for this specific route.
   *
   * If set to `false`, the plugin will not log access to deprecated routes.
   */
  logDeprecationAccess?: boolean;
};

/**
 * ## Deprecation Plugin Options
 *
 * Options for the Deprecation Plugin
 */
export type DeprecationPluginOptions = {
  /**
   * ### Deprecated Routes
   * List of deprecated routes with their deprecation dates if specified.
   */
  deprecatedRoutes?: DeprecatedRoute[];
  /**
   * ### Deprecation Message
   * Default message to use when a route is deprecated.
   *
   * This message **will be used** when the `deprecationDate` is not set for a specific route.
   */
  deprecationMessage?: string;
  /**
   * ### Reject After Deprecation
   * This option is used to determine if all routes should be rejected after their deprecation dates.
   * By default, the plugin will not reject routes after the deprecation date.
   *
   * **Note**: This option **will not override the local route** option if set for a specific route.
   *
   * If set to `true`, the route will be rejected with a `410 status code` after the deprecation date.
   */
  rejectAfterDeprecation?: boolean;
  /**
   * ## Log Deprecation Access
   * This option is used to determine if the plugin should log access to deprecated routes.
   * By default, the plugin will log access to all deprecated routes.
   *
   * **Note**: This option **will not override the local route** option if set for a specific route.
   *
   * If set to `false`, the plugin **will not log** access to deprecated routes.
   */
  logDeprecationAccess?: boolean;
  /**
   * ## Deprecated In Schema
   * This option is used to determine if the deprecated routes should be marked as deprecated in the OpenAPI schema.
   * By default, the plugin **will mark deprecated** routes in the OpenAPI schema.
   *
   * If set to `false`, the plugin **will not mark** deprecated routes in the OpenAPI schema.
   */
  setDeprecatedInSchema?: boolean;
};

// Extended schema interface for OpenAPI support
export interface ExtendedSchema extends FastifySchema {
  deprecated?: boolean;
  description?: string;
  summary?: string;
  tags?: string[];
  externalDocs?: {
    description?: string;
    url: string;
  };
}
