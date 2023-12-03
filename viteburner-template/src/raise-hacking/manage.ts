import { NS } from "../NetscriptDefinitions";
import { DataBroker } from "../global_data/data";
import * as FlagTypes from "../types/Flags"

let broker = new DataBroker()
let options_schema:FlagTypes.OptionsSchema = [
  ["min_maxram", Math.pow(2,10)],
  ["target", "n00dles"],
  ["thread_percentage", 1.0],
  ["help", false],
]

let script_name = "raise-hacking/weaken.js"

export async function main (ns:NS) {
    ns.tail()

    let options = ns.flags( options_schema ) 

    if ( options.help ) {
      ns.tprint ( `WARNING ${ns.getScriptName()} : ${JSON.stringify( options_schema )}`)
      ns.closeTail()
      ns.exit()
    }
    
    let target            = <string>options.target
    let min_maxram        = <number>options.min_maxram
    let thread_percentage = <number>options.thread_percentage
    
    for( let script_host of broker.script_hosts ){
      if ( script_host.maxRam < min_maxram ) continue

      let mem_required_per_thread = ns.getScriptRam( script_name )
      let threads = Math.floor( thread_percentage * script_host.maxRam / mem_required_per_thread?? 1 )
      ns.exec(script_name, script_host.hostname, threads, target)
    }
}

export function autocomplete( data:any, args:any ) {
  data.flags( options_schema )
  return [data.flags]
}