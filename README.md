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

### Registering the Plugin

First, create a Fastify instance and register the `fastify-deprecated` plugin with your desired configuration:
<details>
  <summary>Show full example</summary>

```typescript
import Fastify from 'fastify';
import fastifyDeprecated from 'fastify-deprecated';

const app = Fastify();

app.register(fastifyDeprecated, {
    deprecatedRoutes: [
        {
            path: "/deprecated-route",
            alternate: "/new-route",
            deprecationDate: "2025-01-01",
            rejectAfterDeprecation: true
        },
    ],
});

app.get('/deprecated-route', (request, reply) => {
    reply.send({ message: "This route is deprecated." });
});

app.get('/new-route', (request, reply) => {
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

```typescript
import fastifyDeprecated from 'fastify-deprecated';

app.register(fastifyDeprecated, {
    deprecatedRoutes: [
        { 
            path: "/deprecated-route", 
            alternate: "/new-route",
            deprecationDate: "2025-01-01", 
            rejectAfterDeprecation: true
        },
    ],
});

app.get('/deprecated-route', (request, reply) => {
    reply.send({ message: "This route is deprecated." });
});
```

[Back to top](#fastify-deprecated)
### Response Example

When accessing a deprecated route, the response will include the following:

> **Status Code**: :warning: **410 Gone**

> **Headers**:
> - `deprecation`: `2025-01-01`
> - `link`: `</new-route>; rel="alternate,deprecated"`

> **Body**:
> ```json
> {
>   "error": "Gone",
>   "message": "This route has been deprecated as of 2025-01-01T00:00:00.000Z and is no longer available. Please use /new-route instead."
> }
> ```

[Back to top](#fastify-deprecated)

## Options

The plugin accepts the following options:

| Option | Description | Required | Default |
|--------|-------------|----------|---------|
| [`deprecatedRoutes`](#deprecated-routes-configuration) | An array of objects that define the deprecated routes. | :heavy_check_mark: | `[]` |
| `deprecationMessage` | A custom message to include in the response body. | :heavy_multiplication_x: | `"This route is deprecated and may be removed in the future."` |
| `rejectAfterDeprecation` | A boolean indicating whether to reject requests to the deprecated route after the deprecation date. | :heavy_multiplication_x: | `false`
| `logDeprecationAccess` | A boolean indicating whether to log access to deprecated routes. | :heavy_multiplication_x: | `true` |

[Back to top](#fastify-deprecated)

## Deprecated Routes Configuration

The `deprecatedRoutes` option is an array of objects that define the deprecated routes. 

| Property | Description | Required | Default |
|----------|-------------|----------|---------|
| `path` | The path of the deprecated route. | :heavy_check_mark: |  |
| `alternate` | The path of the alternate route. | :heavy_multiplication_x: |  |
| `deprecationDate` | The date when the route was deprecated. | :heavy_multiplication_x: |  |
| `rejectAfterDeprecation` | A boolean indicating whether to reject requests to the deprecated route after the deprecation date. | :heavy_multiplication_x: | `false` |
| `logDeprecationAccess` | A boolean indicating whether to log access to deprecated routes. | :heavy_multiplication_x: | `true` |

[Back to top](#fastify-deprecated)

## Compatibility
| Plugin version | Fastify version |
| ---------------|-----------------|
| `^1.x`         | `^5.x`          |
| `^1.x`         | `^4.x`          |


Please note that if a Fastify version is out of support, then so are the corresponding version(s) of this plugin
in the table above.
See [Fastify's LTS policy](https://github.com/fastify/fastify/blob/main/docs/Reference/LTS.md) for more details.

[Back to top](#fastify-deprecated)

## Contributing
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://standardjs.com/)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

We welcome contributions to the Fastify-Deprecated plugin! If you would like to contribute, please follow these guidelines:

1. **Fork** the repository.
2. **Clone** your forked repository to your local machine.
3. **Install** dependencies using `npm i`.
4. **Create a new branch** for your feature or bugfix.
5. **Write** your code and tests.
6. **Test** your changes using `npm test`.
7. **Commit** your changes using `git commit`. You will be guided through the process of making a commit message.
   > **Note**: We use [Commitizen](http://commitizen.github.io/cz-cli/) to format our commit messages and enforce [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) through commitlint.
   > **Note**: We use `husky` to run commit hooks that check for tests and formatting.
8. **Push** your branch to your forked repository.
9. **Create a pull request** from your forked repository's branch to the `dev` branch of this repository.



Thank you for your contributions!

[Back to top](#fastify-deprecated)
## License

Licensed under [MIT](./LICENSE).

[Back to top](#fastify-deprecated)
