import { NS } from "../NetscriptDefinitions";
import { ServerPath} from "../lib/ServerPath";

export async function main(ns:NS) {
  let pather = new ServerPath(ns,ns.getHostname(), ns.args[0].toString())

  pather.goToTarget()
}

export function autocomplete(data:any, args:any) {
  let results = []
  if ( data.servers ) results.push( ...data.servers )
  if ( data.scripts ) results.push( ...data.scripts )

  return results
}
