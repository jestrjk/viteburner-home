/* eslint-disable */
import {NS, PortData} from "../NetscriptDefinitions"

/**
* converts an amount to decimal percentage, ie
* 0%   = 0 
* * 25%  = .25 
* 54%  = .54 
* 100% = 1
* 200% = 2
* 
* @param {number} amount in %s ie: 10 50 100 250 (all representing %s)
* */
export function toPercent ( amount: number) { return amount/100 }

export function toMillions( amount: number ): number { return amount/1000000 } 
export function toMillionsFormatted( amount: number ): string { return `$${(amount/1000000).toFixed(1)}m` }
export function toBillions( amount: number ) { return amount/1000000000 } 

/** @param seconds amount (of seconds) to convert to minutes */
export function toMinutes ( seconds: number) { return seconds/60 }
export function toHoursFromMinutes ( minutes: number ) { return minutes/60 }

/** @param seconds amount (of seconds) to convert to hours */
export function toHours   ( seconds: number) { return seconds/3600 }

export const colors = {
  black:          '\u001b[30m',
  red:            '\u001b[31m',
  green:          '\u001b[32m',
  yellow:         '\u001b[33m',
  blue:           '\u001b[34m',
  magenta:        '\u001b[35m',
  cyan:           '\u001b[36m',
  white:          '\u001b[37m',
  brightBlack:    '\u001b[30;1m',
  brightRed:      '\u001b[31;1m',
  brightGreen:    '\u001b[32;1m',
  brightYellow:   '\u001b[33;1m',
  brightBlue:     '\u001b[34;1m',
  brightMagenta:  '\u001b[35;1m',
  brightCyan:     '\u001b[36;1m',
  reset:          '\u001b[0m'
};

export async function testPort( ns:NS, data: any ) {
  
  ns.writePort(1, JSON.stringify( data ) )
  ns.print( `wrote data to port 1` )
  await ns.sleep( 1000 ) 

  let peek_data = ns.peek(1)
  ns.print( `Peeked:` )
  ns.print( JSON.parse( peek_data.toString() ) )
  await ns.sleep( 1000 )

  let read_data = ns.readPort( 1 ) 
  ns.print( `read data`)
  ns.print( JSON.parse ( read_data.toString() ) )

  ns.clearPort( 1 )
  let count = 0
  let results: PortData | null 
  while ( ( results = ns.writePort( 1, 'asdfghjk' )) == null ) {
    count ++
  }
  
  ns.print( `Wrote 'asdfghjk' ${count} times. ~${count*8}B`)
}

export function printUsage(schema:any[]) {

}
export function disableNSFunctionLogging(ns:NS) {
  ns.disableLog( 'sleep' )  
  ns.disableLog( 'asleep' )  
	ns.disableLog( `exec` )
	ns.disableLog( `getServer` )
	ns.disableLog( `getServerUsedRam` )
	ns.disableLog( `getServerMaxRam` )
	ns.disableLog( `getServerMoneyAvailable` )
	ns.disableLog( `getServerMaxMoney` )
	ns.disableLog( `getServerMinSecurityLevel` )
	ns.disableLog( `getServerSecurityLevel` )
	ns.disableLog( `getWeakenTime` )
	ns.disableLog( `weakenAnalyze` )
	ns.disableLog( `getGrowTime` )
	ns.disableLog( `growthAnalyze` )

}