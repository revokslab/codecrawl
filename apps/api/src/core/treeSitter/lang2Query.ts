import {
  queryC,
  queryCpp,
  queryCSharp,
  queryCss,
  queryGo,
  queryJava,
  queryJavascript,
  queryPhp,
  queryPython,
  queryRuby,
  queryRust,
  querySolidity,
  querySwift,
  queryTypescript,
  queryVue,
} from './queries'

export const lang2Query = {
  javascript: queryJavascript,
  typescript: queryTypescript,
  c: queryC,
  cpp: queryCpp,
  python: queryPython,
  rust: queryRust,
  c_sharp: queryCSharp,
  java: queryJava,
  php: queryPhp,
  swift: querySwift,
  solidity: querySolidity,
  css: queryCss,
  vue: queryVue,
  ruby: queryRuby,
  go: queryGo,
}

export type SupportedLang = keyof typeof lang2Query
