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
const allmethods = [ ...Object.keys(methodLevel), ...nostd ];
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

interface ConsoleLevelOptions {
  level?: string | number;
  enabled?: boolean;
  dynamic?: boolean;
}

export class ConsoleLevel implements Console {
  static readonly levelNumMap = levelNumMap;
  static readonly levelStrMap = levelStrMap;
  static readonly methodLevel = methodLevel;

  private out: any;
  private opt: ConsoleLevelOptions;

  get disabled() { return !this.enabled; }
  set disabled(t: boolean) { this.enabled = !t; }
  get enabled() { return !!this.opt.enabled; }
  set enabled(t: boolean) {
    if (this.enabled === !!t) return;
    this.opt.enabled = !!t;
    if (!this.dynamic) this.init();
  }
  get dynamic() { return !!this.opt.dynamic; }
  set dynamic(t: boolean) {
    if (this.dynamic === !!t) return;
    this.opt.dynamic = !!t;
    this.init();
  }
  get levelNum() { return levelNum(this.level); }
  get levelStr() { return levelStr(this.level); }
  get level() { return this.opt.level ?? 'log'; }
  set level(l: string | number) {
    if (this.levelNum === levelNum(l)) {
      this.opt.level = l;
      return;
    }
    this.opt.level = l;
    if (!this.dynamic) this.init();
  }

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

  constructor(cons: Console = console, opt?: ConsoleLevelOptions) {
    this.out = cons;
    this.opt = { enabled: true, level: 'log', dynamic: false, ...opt };
    this.init();
    for (const method in this.out) {
      if ((this as any)[method]) continue;
      // unknown method
      const fn = this.out[method];
      if (typeof fn === 'function') {
        (this as any)[method] = (...arg: any[]) => {
          if (this.enabled) {
            this.out[method](...arg);
          }
        };
      }
    }
  }

  private init() {
    for (const method of allmethods) {
      if (this.dynamic) {
        (this as any)[method] = (...arg: any[]) => {
          if (this.enabled && this.levelNum <= (methodLevel[method] ?? levelNumMap.error)) {
            const fn = this.out[method];
            if (typeof fn === 'function') fn(...arg);
          }
        };
      } else if (this.enabled && this.levelNum <= (methodLevel[method] ?? levelNumMap.error)) {
        const fn = this.out[method];
        (this as any)[method] = typeof fn === 'function' ? fn.bind(this.out) : nop;
      } else {
        (this as any)[method] = nop;
      }
    }
  }

  private static single?: ConsoleLevel;
  static get logger() {
    return ConsoleLevel.single || (ConsoleLevel.single = new ConsoleLevel());
  }
}
