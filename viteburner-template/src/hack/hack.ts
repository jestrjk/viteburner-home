import {NS} from "../NetscriptDefinitions"
import { DataBroker } from "../global_data/data"

export async function main(ns : NS) {
  try {

    let target: string  = ns.args[0] as string

    let hack_result = await ns.hack( target )

  } catch(err) {throw err}
  
}

