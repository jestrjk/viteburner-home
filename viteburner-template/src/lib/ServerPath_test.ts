import { NS } from "../NetscriptDefinitions";
import { ServerPath } from "./ServerPath";

export async function main(ns:NS) {
  ns.clearLog()
  ns.tail()
  ns.disableLog( "sleep" )
  ns.disableLog( "asleep" )

  let source = <string> ns.args[0]
  let target = <string> ns.args[1]

  ns.print( `${source} => ${target}`)

  let server_path = new ServerPath( ns, source,target  )
  
  ns.print( `Path: ${JSON.stringify( server_path.path, null, 1)}`)
  ns.print( `Visited: ${JSON.stringify( server_path.visited, null, 1)}`)

  for ( let next_server of server_path.path ) {
    ns.print( `Connecting to ${next_server}`)
    ns.singularity.connect( next_server ) 
    ns.print( `Arrived ${ns.singularity.getCurrentServer()}`)

    await ns.sleep( 1000 )
  }
}