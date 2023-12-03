import {NS} from "../NetscriptDefinitions"
import * as PM from "../lib/PortManager"

export async function main (ns:NS) {
  ns.tail()
  ns.resizeTail( 700, 300)
  ns.moveTail( 1175, 820)

  let pm = PM.getPortManager(ns,PM.PortNumbers.liteScriptResults) 
  //ns.print( `PM.getPortManager()`)
  while (true) {
    try {
      //ns.print( `[${ns.getScriptName()}] while(true)`)

      if ( pm.hasContent()) {
        let results = pm.readJSONPort()
        ns.print( JSON.stringify( results, null, 1 ))
      } else { 
        ns.print ( `NO CONTENT`)
        await ns.asleep( 5000 )
      }
    } catch ( err ) { ns.print( err ) }
    
    await ns.asleep( 100 )
  }
}