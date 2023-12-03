/* eslint-disable */
import {NS} from "../NetscriptDefinitions"
import { DataBroker } from "../global_data/data"

export async function main(ns: NS) {
   try {
    let target  = ns.args[0] as string

    // let broker = new DataBroker()
    // broker.data.server_diffs.push(  {
    //   timestamp: Date.now(),
    //   hostname: target,
    //   diff_summary: "weaken",
    // })

    let weaken_result = await ns.weaken( target )
    
  } catch(err) {throw err}
  
}

