import { NS } from "../NetscriptDefinitions";
import { ServerPath} from "../lib/ServerPath";

export async function main(ns:NS) {
  ns.tail()
  let pather = new ServerPath(ns,ns.getHostname(), ns.args[0].toString())
  
  pather.goToTarget()
  await ns.singularity.installBackdoor()
  await ns.sleep(5000)
  ns.closeTail()
}

export function autocomplete(data:any, args:any) {
  let results = []
  if ( data.servers ) results.push( ...data.servers )
  if ( data.scripts ) results.push( ...data.scripts )

  return results
}
