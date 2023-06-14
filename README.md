anatomic-bunyan
===============

An [anatomic](https://github.com/add1ed/anatomic) component for bunyan.

## tl;dr

```js
const anatomic = require("anatomic");
const logger = require("anatomic-bunyan");

async function main() {
  const system = anatomic()
    .add('logger', logger()).dependsOn("config")
    .configure({ logger: { level: 'info', name: 'pizza' } });

  const { logger } = await system.start()
  logger.info({ toppings: ['olives', 'capers', 'anchovies'] }, "I love Pizza Napoli!");
}

main();
```