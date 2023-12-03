import { ScriptArg } from "../NetscriptDefinitions"

export type OptionsSchema   = [string, string | number | boolean | string[]][] 
export type FlagsResult     = { [key: string]: ScriptArg | string[] }
export type OptionResult    = string[]|ScriptArg