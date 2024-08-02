/*!
 * console-level
 * Copyright (c) 2019-2024 Satoshi Nakagawa
 */

// [ level: string, methods: string[] ][]
const table = [
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
] as const;

const nostd = [
  // 'memory',
  // 'exception',
  'timeStamp',
  //
  'profile',
  'profileEnd',
] as const;

const aliases: { [level: string]: string } = {
  debug: 'log',
  fatal: 'error',
  quiet: 'silent',
} as const;

type LevelNumber = { [key: string]: number };
type LevelString = { [key: string]: string };

const levelNumber: LevelNumber = {};
const levelString: LevelString = {};
const methodLevel: LevelNumber = {};

table.reduce(([ n, s, m ], [ level, methods ], num: number) => {
  n[level] = n[level.toUpperCase()] = n[num] = num;
  s[level] = s[level.toUpperCase()] = s[num] = level;
  for (const method of methods) m[method] = num;
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

type ConsoleType = Console;
type ConsoleExt = ConsoleType & {
  [method: string]: unknown
};
type InspectorMethod = (label?: string) => void;

export class ConsoleLevel implements ConsoleType {
  static readonly levelNumber = levelNumber;
  static readonly levelString = levelString;
  static readonly methodLevel = methodLevel;

  // Console: ConsoleType['Console'] = console.Console || ConsoleLevel;

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
    const n = this.levelNum;
    this.opt.level = v;
    if (n !== levelNum(v) && !this.dynamic) this.init();
  }

  in(level: string | number): boolean {
    return this.enabled && this.levelNum <= levelNum(level);
  }

  assert: ConsoleType['assert'] = nop;
  clear: ConsoleType['clear'] = nop;
  count: ConsoleType['count'] = nop;
  countReset: ConsoleType['countReset'] = nop;
  debug: ConsoleType['debug'] = nop;
  dir: ConsoleType['dir'] = nop;
  dirxml: ConsoleType['dirxml'] = nop;
  error: ConsoleType['error'] = nop;
  group: ConsoleType['group'] = nop;
  groupCollapsed: ConsoleType['groupCollapsed'] = nop;
  groupEnd: ConsoleType['groupEnd'] = nop;
  info: ConsoleType['info'] = nop;
  log: ConsoleType['log'] = nop;
  table: ConsoleType['table'] = nop;
  time: ConsoleType['time'] = nop;
  timeEnd: ConsoleType['timeEnd'] = nop;
  timeLog: ConsoleType['timeLog'] = nop;
  trace: ConsoleType['trace'] = nop;
  warn: ConsoleType['warn'] = nop;

  get memory() { return this.out.memory; }
  // exception: ConsoleType['exception'] = nop;
  // exception: any = nop;
  timeStamp: ConsoleType['timeStamp'] = nop;

  // profile: ConsoleType['profile'] = nop;
  // profileEnd: ConsoleType['profileEnd'] = nop;
  profile: InspectorMethod = nop;
  profileEnd: InspectorMethod = nop;

  constructor(out: ConsoleType = console, opt?: ConsoleLevelOptions) {
    this.out = out as ConsoleExt;
    this.opt = { enabled: true, level: 'log', dynamic: false, ...opt };
    this.init();
    const self = this as unknown as ConsoleExt;
    for (const method in this.out) {
      if (method in this) continue;
      // unknown method
      const fn = this.out[method];
      if (typeof fn === 'function') {
        self[method] = (...args: unknown[]) => {
          if (this.enabled) {
            fn.apply(this.out, args);
          }
        };
      }
    }
  }

  private out: ConsoleExt;
  private opt: ConsoleLevelOptions;

  private init() {
    const self = this as unknown as ConsoleExt;
    for (const method of allmethods) {
      if (this.dynamic) {
        self[method] = (...args: unknown[]) => {
          if (this.enabled && this.levelNum <= (methodLevel[method] ?? levelNumber.error)) {
            const fn = this.out[method];
            if (typeof fn === 'function') fn.apply(this.out, args);
          }
        };
      } else if (this.enabled && this.levelNum <= (methodLevel[method] ?? levelNumber.error)) {
        const fn = this.out[method];
        self[method] = typeof fn === 'function' ? fn.bind(this.out) : nop;
      } else {
        self[method] = nop;
      }
    }
  }

  private static single?: ConsoleLevel;
  static get logger() {
    ConsoleLevel.single ||= new ConsoleLevel();
    return ConsoleLevel.single;
  }
}

export default ConsoleLevel;
