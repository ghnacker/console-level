/*!
 * console-level
 * Copyright (c) 2019 Satoshi Nakagawa
 */

const grouping: { [level: string]: string[] } = {
  log: [
    'debug',
    'dir',
    'dirxml',
    'group',
    'groupCollapsed',
    'groupEnd',
    'log',
    'table',
    'time',
    'timeLog',
    'trace',
  ],
  info: [
    'count',
    'info',
    'timeEnd',
  ],
  warn: [
    'countReset',
    'warn',
  ],
  error: [
    'assert',
    'clear',
    'error',
  ],
  silent: []
};

const aliases: { [level: string]: string } = {
  debug: 'log',
  fatal: 'error',
  quiet: 'silent',
};

const logLevel: any = {};
const methodLevel: { [method: string]: number } = {};
Object.keys(grouping).forEach((k, i) => {
  logLevel[i] = k;
  logLevel[k] = logLevel[k.toUpperCase()] = i;
  grouping[k].forEach(m => {
    methodLevel[m] = i;
  });
});
for (const k in aliases) {
  logLevel[k] = logLevel[k.toUpperCase()] = logLevel[aliases[k]];
}

export class ConsoleLevel {

  static readonly grouping = grouping;
  static readonly aliases = aliases;
  static readonly logLevel = logLevel;
  static readonly methodLevel = methodLevel;

  level: string | number = 'log';
  get levelnum(): number {
    const level = this.level;
    return typeof level === 'number' ? level : logLevel[level] || 0;
  }

  enabled: boolean = true;
  get disabled() { return !this.enabled; }
  set disabled(d: boolean) { this.enabled = !d; }

  [method: string]: any;

  constructor(logger: any = console) {
    for (const method in methodLevel) {
      if (typeof logger[method] === 'function') {
	this[method] = (...arg: any[]) => {
	  if (this.levelnum <= methodLevel[method]) {
	    logger[method](...arg);
	  }
	};
      } else {
	this[method] = () => {};
      }
    }
    for (const method in logger) {
      if (!this[method] && typeof logger[method] === 'function') {
	this[method] = (...arg: any[]) => {
	  if (this.levelnum <= 0) {
	    logger[method](...arg);
	  }
	};
      }
    }
  }

  static logger = new ConsoleLevel();
}
