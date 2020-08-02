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
  'timeStamp',
  // 'memory',
];
const aliases: { [level: string]: string } = {
  debug: 'log',
  fatal: 'error',
  quiet: 'silent',
};

type LevelNumber = { [key: string]: number };
type LevelString = { [key: string]: string };
const levelNumber: LevelNumber = {};
const levelString: LevelString = {};
const methodLevel: LevelNumber = {};
table.reduce(([ n, s, m ], [ level, methods ], num: number) => {
  n[level] = n[level.toUpperCase()] = n[num] = num;
  s[level] = s[level.toUpperCase()] = s[num] = level;
  methods.forEach(method => m[method] = num);
  return [ n, s, m ];
}, [ levelNumber, levelString, methodLevel ]);
const allmethods = [ ...Object.keys(methodLevel), ...nostd ];
for (const k in aliases) {
  const n = levelNumber;
  const s = levelString;
  const a = aliases[k];
  const u = k.toUpperCase();
  n[k] = n[u] = n[a];
  s[k] = s[u] = s[a];
}
const levelNum = (level: string | number) => {
  return levelNumber[level] ?? levelNumber.log;
}
const levelStr = (level: string | number) => {
  return levelString[level] ?? levelString.log;
}

const nop = () => {};

interface ConsoleLevelOptions {
  level?: string | number;
  enabled?: boolean;
  dynamic?: boolean;
}

export class ConsoleLevel implements Console {
  static readonly levelNumber = levelNumber;
  static readonly levelString = levelString;
  static readonly methodLevel = methodLevel;

  get disabled() { return !this.enabled; }
  set disabled(v: boolean) { this.enabled = !v; }
  get enabled() { return !!this.opt.enabled; }
  set enabled(v: boolean) {
    if (this.enabled === !!v) return;
    this.opt.enabled = !!v;
    if (!this.dynamic) this.init();
  }
  get dynamic() { return !!this.opt.dynamic; }
  set dynamic(v: boolean) {
    if (this.dynamic === !!v) return;
    this.opt.dynamic = !!v;
    this.init();
  }
  get levelNum() { return levelNum(this.level); }
  get levelStr() { return levelStr(this.level); }
  get level() { return this.opt.level ?? 'log'; }
  set level(v: string | number) {
    if (this.levelNum === levelNum(v)) {
      this.opt.level = v;
      return;
    }
    this.opt.level = v;
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
  timeStamp: Console['timeStamp'] = nop;
  get memory() { return this.out.memory; }

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

  private out: any;
  private opt: ConsoleLevelOptions;

  private init() {
    for (const method of allmethods) {
      if (this.dynamic) {
        (this as any)[method] = (...arg: any[]) => {
          if (this.enabled && this.levelNum <= (methodLevel[method] ?? levelNumber.error)) {
            const fn = this.out[method];
            if (typeof fn === 'function') fn(...arg);
          }
        };
      } else if (this.enabled && this.levelNum <= (methodLevel[method] ?? levelNumber.error)) {
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
