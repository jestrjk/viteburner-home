import { NS } from "../NetscriptDefinitions";
import { DataBroker, data } from "./data"

const script_name = "./global_data_populate.js"
export async function main (ns:NS) {
  ns.tail()

  let broker = new DataBroker()

  while (true) {
    test(ns,script_name)
    let server = broker.getServerData(ns.getHostname())
    ns.print( JSON.stringify({
      hostame: server.hostname,
      money: server.moneyAvailable
    }))

    await ns.sleep(Math.random()*2000+2000)
  }
}

function test(ns:NS, script_name:string) {
  ns.run(script_name,1,1)
  ns.print( `Player money: ${data!.player?.money}`)
}