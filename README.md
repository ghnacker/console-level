# console-level

Simple logLevel extension for JavaScript console

## Usage

```JavaScript
import { ConsoleLevel } from 'console-level';
```

## Example

```JavaScript
const logger = new ConsoleLevel();

logger.log("log in 'log'");
logger.info("info in 'log'");

logger.level = 'info';
logger.log("log in 'info'");
logger.info("info in 'info'");

logger.enabled = false;
logger.log("log in 'disabled'");
logger.info("info in 'disabled'");

// Outputs:
// log in 'log'
// info in 'log'
// info in 'info'
```
