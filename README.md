# Fastify-Deprecated

[![Fastify](https://img.shields.io/badge/Fastify-%5E4.x-blue?style=flat&logo=fastify&logoColor=white)](https://fastify.dev)
[![TypeScript](https://shields.io/badge/TypeScript-3178C6?logo=TypeScript&logoColor=FFF)](https://www.typescriptlang.org)
[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://lbesson.mit-license.org/)

Mark Fastify routes as deprecated

## :rocket: Installation

```shell
npm i fastify-deprecated
```

## Table of Contents

- [Usage](#usage)
  - [Registering the Plugin](#registering-the-plugin)
  - [Response Example](#response-example)
- [Deprecated Routes Configuration](#deprecated-routes-configuration)
- [Options](#options)
- [Compatibility](#compatibility)
- [Contributing](#contributing)
- [License](#license)

## Usage

### Quick Start

Create a Fastify instance and register the fastify-deprecated plugin:

```typescript
import fastifyDeprecated from "fastify-deprecated";

app.register(fastifyDeprecated, {
  deprecatedRoutes: [
    {
      path: "/deprecated-route",
      alternate: "/new-route", // Optional
      deprecationDate: "2025-01-01", // Optional
      rejectAfterDeprecation: true, // False by default
    },
  ],
});

app.get("/deprecated-route", (request, reply) => {
  reply.send({ message: "This route is deprecated." });
});
```

### Full Example

<details>
  <summary>Show full example</summary>

```typescript
import Fastify from "fastify";
import fastifyDeprecated from "fastify-deprecated";

const app = Fastify();

app.register(fastifyDeprecated, {
  deprecatedRoutes: [
    {
      path: "/deprecated-route",
      alternate: "/new-route",
      deprecationDate: "2025-01-01",
      rejectAfterDeprecation: true,
    },
  ],
});

app.get("/deprecated-route", (request, reply) => {
  reply.send({ message: "This route is deprecated." });
});

app.get("/new-route", (request, reply) => {
  reply.send({ message: "This is the new route." });
});

app.listen({ port: 3_000 }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`🚀 Server listening at ${address}`);
});
```

</details>
<br>

[Back to top](#fastify-deprecated)

### Response Example

When accessing a deprecated route, the response will include the following:

> **Status Code**: :warning: **410 Gone**

> **Headers**:
>
> - `deprecation`: `2025-01-01`
> - `link`: `</new-route>; rel="alternate,deprecated"`

> **Body**:
>
> ```json
> {
>   "error": "Gone",
>   "message": "This route has been deprecated as of 2025-01-01T00:00:00.000Z and is no longer available. Please use /new-route instead."
> }
> ```

[Back to top](#fastify-deprecated)

## Global vs. Route-Level Deprecation

The plugin supports both global and route-level deprecation. Global deprecation options apply to all routes, while route-level deprecation options applies to specific routes. If a route has conflicting options, the route-level options take precedence.

### Global Deprecation

```typescript
app.register(fastifyDeprecated, {
  deprecatedRoutes: [
    {
      path: "/deprecated-route",
      deprecationDate: "2025-01-01",
    },
  ],
  rejectAfterDeprecation: true,
  logDeprecationAccess: false,
});
```

> When `rejectAfterDeprecation` is set to `true`, requests to deprecated routes will be rejected after the deprecation date. This is `false` by default on both global and route-level deprecation.
>
> If `logDeprecationAccess` is set to `false`, access to deprecated routes will not be logged.

### Route-Level Deprecation

```typescript
app.register(fastifyDeprecated, {
  deprecatedRoutes: [
    {
      path: "/deprecated-route",
      deprecationDate: "2025-01-01",
    },
    {
      path: "/deprecated-route-not-auto-rejected",
      deprecationDate: "2025-01-01",
      rejectAfterDeprecation: false,
    },
  ],
  rejectAfterDeprecation: true,
});
```

> The `rejectAfterDeprecation` option can be overridden at the route level. In the example above, requests to `/deprecated-route` will be rejected after the deprecation date, while requests to `/deprecated-route-not-auto-rejected` will not be rejected.

## Plugin Options

The plugin accepts the following options:

| Option                                                 | Description                                                                                         | Required                 | Default                                                        |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------- | ------------------------ | -------------------------------------------------------------- |
| [`deprecatedRoutes`](#deprecated-routes-configuration) | An array of objects that define the deprecated routes.                                              | :heavy_check_mark:       | `[]`                                                           |
| [`deprecationMessage`](#deprecation-message)           | A custom message to include in the response body.                                                   | :heavy_multiplication_x: | `"This route is deprecated and may be removed in the future."` |
| [`rejectAfterDeprecation`](#reject-after-deprecation)  | A boolean indicating whether to reject requests to the deprecated route after the deprecation date. | :heavy_multiplication_x: | `false`                                                        |
| [`logDeprecationAccess`](#log-deprecation-access)      | A boolean indicating whether to log access to deprecated routes.                                    | :heavy_multiplication_x: | `true`                                                         |

#### Deprecation Message

The `deprecationMessage` option allows you to customize the message included in the response body when accessing a deprecated route.

This message will be included in the response body when no date or alternate route is provided in the deprecated route configuration.

```json
{
  "error": "Gone",
  "message": "This route is deprecated and may be removed in the future."
}
```

#### Reject After Deprecation

By default, requests to deprecated routes will still be accepted after the deprecation date. This default behavior is to prevent breaking changes for clients that may not have updated their code. It's easy to forget to this plugin is in place and on a Friday before a long weekend, you may not want to accidentally break your clients' code.

However, you can set `rejectAfterDeprecation` to `true` at a global or local level to reject requests to deprecated routes after the deprecation date.

#### Log Deprecation Access

By default, access to deprecated routes will be logged. If you want to disable logging, you can set `logDeprecationAccess` to `false`. This is useful for capturing metrics on how many users are still accessing deprecated routes and adjusting your deprecation strategy accordingly.

[Back to top](#fastify-deprecated)

## Deprecated Routes Configuration

The `deprecatedRoutes` option is an array of objects that define the deprecated routes.

| Property                 | Description                                                                                         | Required                 | Default |
| ------------------------ | --------------------------------------------------------------------------------------------------- | ------------------------ | ------- |
| `path`                   | The path of the deprecated route.                                                                   | :heavy_check_mark:       |         |
| `alternate`              | The path of the alternate route.                                                                    | :heavy_multiplication_x: |         |
| `deprecationDate`        | The date when the route was deprecated.                                                             | :heavy_multiplication_x: |         |
| `rejectAfterDeprecation` | A boolean indicating whether to reject requests to the deprecated route after the deprecation date. | :heavy_multiplication_x: | `false` |
| `logDeprecationAccess`   | A boolean indicating whether to log access to deprecated routes.                                    | :heavy_multiplication_x: | `true`  |
| `setDeprecatedInSchema`  | A boolean indicating whether to set the route as deprecated in the OpenAPI schema.                  | :heavy_multiplication_x: | `true`  |

[Back to top](#fastify-deprecated)

## Compatibility

| Plugin version | Fastify version |
| -------------- | --------------- |
| `^1.x`         | `^5.x`          |
| `^1.x`         | `^4.x`          |

Please note that if a Fastify version is out of support, then so are the corresponding version(s) of this plugin
in the table above.
See [Fastify's LTS policy](https://github.com/fastify/fastify/blob/main/docs/Reference/LTS.md) for more details.

[Back to top](#fastify-deprecated)

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](./docs/CONTRIBUTING.md) for more details.

[Back to top](#fastify-deprecated)

## License

Licensed under [MIT](./LICENSE).

[Back to top](#fastify-deprecated)
