/*!
 * console-level
 * Copyright (c) 2019, 2020 Satoshi Nakagawa
 */

// [ level: string, methods: string[] ][]
const table: [string, string[]][] = [
  [ 'all', [] ],
  [ 'log', [
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
  ]],
  [ 'info', [
    'count',
    'info',
    'timeEnd',
  ]],
  [ 'warn', [
    'countReset',
    'warn',
  ]],
  [ 'error', [
    'assert',
    'clear',
    'error',
  ]],
  [ 'silent', [] ]
];
const aliases: { [level: string]: string } = {
  debug: 'log',
  fatal: 'error',
  quiet: 'silent',
};

type LevelNumberMap = { [key: string]: number };
type LevelStringMap = { [key: string]: string };
const levelNumMap: LevelNumberMap = {};
const levelStrMap: LevelStringMap = {};
const methodLevel: LevelNumberMap = {};
table.reduce(([ n, s, m ], [ level, methods ], num: number) => {
  n[level] = n[level.toUpperCase()] = n[num] = num;
  s[level] = s[level.toUpperCase()] = s[num] = level;
  methods.forEach(method => m[method] = num);
  return [ n, s, m ];
}, [ levelNumMap, levelStrMap, methodLevel ]);
for (const k in aliases) {
  const n = levelNumMap;
  const s = levelStrMap;
  const a = aliases[k];
  const u = k.toUpperCase();
  n[k] = n[u] = n[a];
  s[k] = s[u] = s[a];
}
const levelNum = (level: string | number) => {
  return levelNumMap[level] ?? levelNumMap.log;
}
const levelStr = (level: string | number) => {
  return levelStrMap[level] ?? levelStrMap.log;
}

const nop = () => {};

export class ConsoleLevel {
  static readonly levelNumMap = levelNumMap;
  static readonly levelStrMap = levelStrMap;
  static readonly methodLevel = methodLevel;

  level: string | number = 'log';
  get levelNum() { return levelNum(this.level); }
  get levelStr() { return levelStr(this.level); }

  enabled: boolean = true;
  get disabled() { return !this.enabled; }
  set disabled(d: boolean) { this.enabled = !d; }

  in(level: string | number): boolean {
    return this.enabled && this.levelNum <= levelNum(level);
  }

  [method: string]: any;

  constructor(logger: any = console) {
    for (const method in methodLevel) {
      if (typeof logger[method] === 'function') {
        this[method] = (...arg: any[]) => {
          if (this.enabled && this.levelNum <= methodLevel[method]) {
            logger[method](...arg);
          }
        };
      } else {
        this[method] = nop;
      }
    }
    for (const method in logger) {
      if (!this[method] && typeof logger[method] === 'function') {
        this[method] = (...arg: any[]) => {
          if (this.enabled && this.levelNum < levelNumMap.silent) {
            logger[method](...arg);
          }
        };
      }
    }
  }

  static logger = new ConsoleLevel();
}
