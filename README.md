# console-level

Simple logLevel extension for JavaScript console

# Usage

```JavaScript
import { ConsoleLevel } from 'console-level';

const logger = ConsoleLevel();

logger.log('log 0');
logger.info('info 0');
logger.level = 'info';
logger.log('log 1');
logger.info('info 1');
```
