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
const nostd = [
  'exception',
  'memory',
  'timeStamp',
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

export class ConsoleLevel implements Console {
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

  assert: Console['assert'] = nop;
  clear: Console['clear'] = nop;
  count: Console['count'] = nop;
  countReset: Console['countReset'] = nop;
  debug: Console['debug'] = nop;
  dir: Console['dir'] = nop;
  dirxml: Console['dirxml'] = nop;
  error: Console['error'] = nop;
  group: Console['group'] = nop;
  groupCollapsed: Console['groupCollapsed'] = nop;
  groupEnd: Console['groupEnd'] = nop;
  info: Console['info'] = nop;
  log: Console['log'] = nop;
  table: Console['table'] = nop;
  time: Console['time'] = nop;
  timeEnd: Console['timeEnd'] = nop;
  timeLog: Console['timeLog'] = nop;
  trace: Console['trace'] = nop;
  warn: Console['warn'] = nop;

  exception: Console['exception'] = nop;
  memory: Console['memory'] = nop;
  timeStamp: Console['timeStamp'] = nop;

  private out: any;

  private bindIt(method: string) {
    const fn = this.out[method];
    if (typeof fn === 'function') {
      (this as any)[method] = fn.bind(this.out);
    }
  }

  constructor(cons: Console = console) {
    this.out = cons;
    for (const method in nostd) {
      this.bindIt(method);
    }
    for (const method in methodLevel) {
      if (typeof this.out[method] === 'function') {
        (this as any)[method] = (...arg: any[]) => {
          if (this.enabled && this.levelNum <= methodLevel[method]) {
            this.out[method](...arg);
          }
        };
      } else {
        (this as any)[method] = nop;
      }
    }
    for (const method in this.out) {
      if (!(this as any)[method] && typeof this.out[method] === 'function') {
        (this as any)[method] = (...arg: any[]) => {
          if (this.enabled && this.levelNum < levelNumMap.silent) {
            this.out[method](...arg);
          }
        };
      }
    }
  }

  private static single?: ConsoleLevel;
  static get logger() {
    return ConsoleLevel.single || (ConsoleLevel.single = new ConsoleLevel());
  }
}
