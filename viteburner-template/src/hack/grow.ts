/* eslint-disable */
import {NS} from "../NetscriptDefinitions"
import * as PM from "../lib/PortManager"
import { DataBroker } from "../global_data/data"


export async function main(ns: NS) {
  try {
    let broker = new DataBroker()
    let target:string = ns.args[0] as string
    
    let grow_result = await ns.grow( target ) 

    let result:PM.LiteScriptJSONParams = {
      result: grow_result,
      hostname: target, 
      hacktype: PM.hackTypes.grow
    }


    
  } catch(err) {throw err}
}

