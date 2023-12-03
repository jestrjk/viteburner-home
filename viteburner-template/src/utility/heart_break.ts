import {NS} from "../NetscriptDefinitions"

export async function main(ns:NS) {
  ns.tail()
  ns.disableLog( "sleep")

  while( true ) {
    ns.clearLog()

    
    await ns.sleep(1000)
  }
  

}