import { describe, expect, test, vi } from "vitest";
import fastifyDeprecated from "../src/index";
import Fastify from "fastify";
import { fastifySwagger } from "@fastify/swagger";

describe("fastify-deprecated", () => {
  test("should add deprecation headers to routes with deprecated date", async () => {
    const fastify = Fastify();
    fastify.register(fastifyDeprecated, {
      deprecatedRoutes: [{ path: "/test", deprecationDate: "2025-01-01" }],
    });

    fastify.get("/test", async (_req, _reply) => {
      return "deprecated route";
    });

    await fastify.ready();

    const response = await fastify.inject({
      method: "GET",
      url: "/test",
    });

    expect(response.headers).toHaveProperty("deprecation");
    expect(response.headers.deprecation).toBe("2025-01-01");
  });
  test("should add deprecation headers to routes without deprecation date", async () => {
    const fastify = Fastify();
    fastify.register(fastifyDeprecated, {
      deprecatedRoutes: [{ path: "/test" }],
    });

    fastify.get("/test", async (_req, _reply) => {
      return "deprecated route";
    });

    await fastify.ready();

    const response = await fastify.inject({
      method: "GET",
      url: "/test",
    });

    expect(response.headers).toHaveProperty("deprecation");
    expect(response.headers.deprecation).toBe("true");
  });

  test("should add deprecation headers to routes with alternate route", async () => {
    const fastify = Fastify();
    fastify.register(fastifyDeprecated, {
      deprecatedRoutes: [{ path: "/test", alternate: "/new-route" }],
    });

    fastify.get("/test", async (_req, _reply) => {
      return "deprecated route";
    });

    await fastify.ready();

    const response = await fastify.inject({
      method: "GET",
      url: "/test",
    });

    expect(response.headers).toHaveProperty("deprecation");
    expect(response.headers.deprecation).toBe("true");
    expect(response.headers).toHaveProperty("link");
    expect(response.headers.link).toBe(
      '</new-route>; rel="alternate,deprecated"',
    );
  });

  test("should return a 200 status code by default when route is past deprecation date", async () => {
    const fastify = Fastify();
    fastify.register(fastifyDeprecated, {
      deprecatedRoutes: [{ path: "/test", deprecationDate: "2021-01-01" }],
    });

    fastify.get("/test", async (_req, _reply) => {
      return "deprecated route";
    });

    await fastify.ready();

    const response = await fastify.inject({
      method: "GET",
      url: "/test",
    });

    expect(response.statusCode).toBe(200);
    expect(response.payload).toBe("deprecated route");
    expect(response.headers).toHaveProperty("deprecation");
    expect(response.headers.deprecation).toBe("2021-01-01");
  });

  test("should return a 410 status code for deprecated routes when rejectAfterDeprecation is true and is past the expiration date", async () => {
    const fastify = Fastify();
    fastify.register(fastifyDeprecated, {
      deprecatedRoutes: [
        {
          path: "/test",
          deprecationDate: "2021-01-01",
          rejectAfterDeprecation: true,
        },
      ],
    });

    fastify.get("/test", async (_req, _reply) => {
      return "deprecated route";
    });

    await fastify.ready();

    const response = await fastify.inject({
      method: "GET",
      url: "/test",
    });

    expect(response.statusCode).toBe(410);
    expect(response.json()).toEqual({
      error: "Gone",
      message:
        "This route has been deprecated as of 2021-01-01T00:00:00.000Z and is no longer available.",
    });
  });

  test("should return 410 status code for deprecated routes when rejectAfterDeprecation is true globally", async () => {
    const fastify = Fastify();
    fastify.register(fastifyDeprecated, {
      deprecatedRoutes: [{ path: "/test", deprecationDate: "2021-01-01" }],
      rejectAfterDeprecation: true,
    });

    fastify.get("/test", async (_req, _reply) => {
      return "deprecated route";
    });

    await fastify.ready();

    const response = await fastify.inject({
      method: "GET",
      url: "/test",
    });

    expect(response.statusCode).toBe(410);
    expect(response.json()).toEqual({
      error: "Gone",
      message:
        "This route has been deprecated as of 2021-01-01T00:00:00.000Z and is no longer available.",
    });
  });

  test("should return 410 status code for deprecated routes when rejectAfterDeprecation is true for specific route", async () => {
    const fastify = Fastify();
    fastify.register(fastifyDeprecated, {
      deprecatedRoutes: [
        {
          path: "/test",
          deprecationDate: "2021-01-01",
          rejectAfterDeprecation: true,
        },
        {
          path: "/not-automatically-deprecated",
          deprecationDate: "2021-01-01",
        },
      ],
    });

    fastify.get("/test", async (_req, _reply) => {
      return "deprecated route";
    });

    fastify.get("/not-automatically-deprecated", async (_req, _reply) => {
      return "not deprecated route";
    });

    await fastify.ready();

    const autoDeprecatedResponse = await fastify.inject({
      method: "GET",
      url: "/test",
    });

    expect(autoDeprecatedResponse.statusCode).toBe(410);
    expect(autoDeprecatedResponse.json()).toEqual({
      error: "Gone",
      message:
        "This route has been deprecated as of 2021-01-01T00:00:00.000Z and is no longer available.",
    });

    const notAutoDeprecatedResponse = await fastify.inject({
      method: "GET",
      url: "/not-automatically-deprecated",
    });

    expect(notAutoDeprecatedResponse.statusCode).toBe(200);
    expect(notAutoDeprecatedResponse.payload).toBe("not deprecated route");
  });

  test("should not return a 401 when returnAfterDeprecation is false for a specific route while globally enabled", async () => {
    const fastify = Fastify();
    fastify.register(fastifyDeprecated, {
      deprecatedRoutes: [
        {
          path: "/test",
          deprecationDate: "2021-01-01",
          rejectAfterDeprecation: false,
        },
        { path: "/automatically-deprecated", deprecationDate: "2021-01-01" },
      ],
      rejectAfterDeprecation: true,
    });

    fastify.get("/test", async (_req, _reply) => {
      return "no reject after deprecation route";
    });

    fastify.get("/automatically-deprecated", async (_req, _reply) => {
      return "deprecated route";
    });

    await fastify.ready();

    const notAutoDeprecatedResponse = await fastify.inject({
      method: "GET",
      url: "/test",
    });

    expect(notAutoDeprecatedResponse.statusCode).toBe(200);
    expect(notAutoDeprecatedResponse.payload).toBe(
      "no reject after deprecation route",
    );

    const autoDeprecatedResponse = await fastify.inject({
      method: "GET",
      url: "/automatically-deprecated",
    });

    expect(autoDeprecatedResponse.statusCode).toBe(410);
    expect(autoDeprecatedResponse.json()).toEqual({
      error: "Gone",
      message:
        "This route has been deprecated as of 2021-01-01T00:00:00.000Z and is no longer available.",
    });
  });

  test("should log deprecation access by default", async () => {
    const fastify = Fastify();
    const logWarn = vi.fn();
    fastify.register(fastifyDeprecated, {
      deprecatedRoutes: [{ path: "/test", deprecationDate: "2021-01-01" }],
    });

    fastify.get("/test", async (_req, _reply) => {
      return "deprecated route";
    });

    fastify.log.warn = logWarn;

    await fastify.ready();

    await fastify.inject({
      method: "GET",
      url: "/test",
    });

    expect(logWarn).toHaveBeenCalled();
    expect(logWarn.mock.calls[0][0]).toContain(
      "Deprecated route accessed: /test. Deprecation date: 2021-01-01T00:00:00.000Z.",
    );
  });

  test("should not log deprecation access when logDeprecationAccess is false", async () => {
    const fastify = Fastify();
    const logWarn = vi.fn();
    fastify.register(fastifyDeprecated, {
      deprecatedRoutes: [{ path: "/test", deprecationDate: "2021-01-01" }],
      logDeprecationAccess: false,
    });

    fastify.get("/test", async (_req, _reply) => {
      return "deprecated route";
    });

    fastify.log.warn = logWarn;

    await fastify.ready();

    await fastify.inject({
      method: "GET",
      url: "/test",
    });

    expect(logWarn).not.toHaveBeenCalled();
  });

  test("should not log deprecation access when logDeprecationAccess is false for specific route", async () => {
    const fastify = Fastify();
    const logWarn = vi.fn();
    fastify.register(fastifyDeprecated, {
      deprecatedRoutes: [
        {
          path: "/test",
          deprecationDate: "2021-01-01",
          logDeprecationAccess: false,
        },
      ],
    });

    fastify.get("/test", async (_req, _reply) => {
      return "deprecated route";
    });

    fastify.log.warn = logWarn;

    await fastify.ready();

    await fastify.inject({
      method: "GET",
      url: "/test",
    });

    expect(logWarn).not.toHaveBeenCalled();
  });

  test("should log deprecation access when logDeprecationAccess is true for specific route", async () => {
    const fastify = Fastify();
    const logWarn = vi.fn();
    fastify.register(fastifyDeprecated, {
      deprecatedRoutes: [
        {
          path: "/test",
          deprecationDate: "2021-01-01",
          logDeprecationAccess: true,
        },
      ],
      logDeprecationAccess: false,
    });

    fastify.get("/test", async (_req, _reply) => {
      return "deprecated route";
    });

    fastify.log.warn = logWarn;

    await fastify.ready();

    await fastify.inject({
      method: "GET",
      url: "/test",
    });

    expect(logWarn).toHaveBeenCalled();
    expect(logWarn.mock.calls[0][0]).toContain(
      "Deprecated route accessed: /test. Deprecation date: 2021-01-01T00:00:00.000Z.",
    );
  });
});

describe("fastify-deprecated with swagger (OpenAPI)", () => {
  test("should add deprecation flag to swagger schema", async () => {
    const fastify = Fastify();
    fastify.register(fastifyDeprecated, {
      deprecatedRoutes: [{ path: "/test", deprecationDate: "2025-01-01" }],
    });

    await fastify.register(fastifySwagger, {
      openapi: {
        openapi: "3.0.0",
        info: {
          title: "Test swagger2",
          description: "Testing the Fastify swagger API",
          version: "1.0.0",
        },
      },
    });

    fastify.get("/test", async (_req, _reply) => {
      return "deprecated route";
    });

    await fastify.ready();

    const route = fastify.swagger().paths;

    if (route && route["/test"] && route["/test"].get) {
      expect(route).toHaveProperty("/test");
      expect(route["/test"].get).toHaveProperty("deprecated", true);
    } else {
      throw new Error("Route or method not defined");
    }
  });

  test("should add deprecation flag to swagger schema for multiple routes", async () => {
    const fastify = Fastify();
    fastify.register(fastifyDeprecated, {
      deprecatedRoutes: [
        { path: "/test1", deprecationDate: "2025-01-01" },
        { path: "/test2", deprecationDate: "2025-02-01" },
      ],
    });

    await fastify.register(fastifySwagger, {
      openapi: {
        openapi: "3.0.0",
        info: {
          title: "Test swagger",
          description: "Testing multiple deprecated routes",
          version: "1.0.0",
        },
      },
    });

    fastify.get("/test1", async (_req, _reply) => "deprecated route 1");
    fastify.get("/test2", async (_req, _reply) => "deprecated route 2");

    await fastify.ready();

    const route = fastify.swagger().paths;

    if (
      route &&
      route["/test1"] &&
      route["/test1"].get &&
      route["/test2"] &&
      route["/test2"].get
    ) {
      expect(route).toHaveProperty("/test1");
      expect(route["/test1"].get).toHaveProperty("deprecated", true);
      expect(route).toHaveProperty("/test2");
      expect(route["/test2"].get).toHaveProperty("deprecated", true);
    }
  });

  test("should add deprecation flag to swagger schema only for deprecated routes", async () => {
    const fastify = Fastify();
    fastify.register(fastifyDeprecated, {
      deprecatedRoutes: [{ path: "/test1", deprecationDate: "2025-01-01" }],
    });

    await fastify.register(fastifySwagger, {
      openapi: {
        openapi: "3.0.0",
        info: {
          title: "Test swagger",
          description: "Testing multiple deprecated routes",
          version: "1.0.0",
        },
      },
    });

    fastify.get("/test1", async (_req, _reply) => "deprecated route 1");
    fastify.get("/test2", async (_req, _reply) => "not deprecated route");

    await fastify.ready();

    const route = fastify.swagger().paths;

    if (
      route &&
      route["/test1"] &&
      route["/test1"].get &&
      route["/test2"] &&
      route["/test2"].get
    ) {
      expect(route).toHaveProperty("/test1");
      expect(route["/test1"].get).toHaveProperty("deprecated", true);
      expect(route).toHaveProperty("/test2");
      expect(route["/test2"].get).not.toHaveProperty("deprecated");
    }
  });

  test("should show externalDocs link in swagger schema for deprecated routes with alternate route", async () => {
    const fastify = Fastify();
    fastify.register(fastifyDeprecated, {
      deprecatedRoutes: [{ path: "/test", alternate: "/new-route" }],
    });

    await fastify.register(fastifySwagger, {
      openapi: {
        openapi: "3.0.0",
        info: {
          title: "Test swagger",
          description: "Testing multiple deprecated routes",
          version: "1.0.0",
        },
      },
    });

    fastify.get("/test", async (_req, _reply) => "deprecated route");

    await fastify.ready();

    const route = fastify.swagger().paths;

    if (route && route["/test"] && route["/test"].get) {
      expect(route).toHaveProperty("/test");
      expect(route["/test"].get).toHaveProperty("externalDocs");
      expect(route["/test"].get.externalDocs).toHaveProperty(
        "url",
        "/new-route",
      );
      expect(route["/test"].get.externalDocs).toHaveProperty(
        "description",
        "Refer to the alternate route for more details.",
      );
    }
  });

  test("should not add deprecated flag to swagger schema when setDeprecatedInSchema is false", async () => {
    const fastify = Fastify();
    fastify.register(fastifyDeprecated, {
      deprecatedRoutes: [{ path: "/test", deprecationDate: "2025-01-01" }],
      setDeprecatedInSchema: false,
    });

    await fastify.register(fastifySwagger, {
      openapi: {
        openapi: "3.0.0",
        info: {
          title: "Test swagger",
          description: "Testing multiple deprecated routes",
          version: "1.0.0",
        },
      },
    });

    fastify.get("/test", async (_req, _reply) => "deprecated route");

    await fastify.ready();

    const route = fastify.swagger().paths;

    if (route && route["/test"] && route["/test"].get) {
      expect(route).toHaveProperty("/test");
      expect(route["/test"].get).not.toHaveProperty("deprecated");
    }
  });
});
