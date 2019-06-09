# console-level

Simple logLevel extension for JavaScript console

## Usage

```JavaScript
const ConsoleLevel = require('console-level').ConsoleLevel;

const logger = new ConsoleLevel();

logger.log('log 0');
logger.info('info 0');
logger.level = 'info';
logger.log('log 1');
logger.info('info 1');
// Outputs:
// log 0
// info 0
// info 1
```
