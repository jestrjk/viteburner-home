import {NS} from "./NetscriptDefinitions";
import {ServerList} from "./lib/ServerList";

export function autocomplete(data:any, args:any) {
  //return [...data.servers]; // This script autocompletes the list of servers.
  return [...data.servers, ...data.scripts]; // Autocomplete servers and scripts
}

export async function main (ns:NS) {
  ns.tail()

  if (ns.args.length < 2) {
    ns.tprint(`${ns.getScriptName()} Usage:`)
    ns.tprint(`${ns.getScriptName()} <script to run:string> <with thread count:number> [args:string[]]`)
    ns.exit()
  }

  let script_to_run_name = <string>ns.args[0]
  let threads = <number>ns.args[1]
  let script_args = ns.args.slice(2)

  let script_ram_required = ns.getScriptRam(script_to_run_name)*threads

  let server_list = new ServerList(ns)
  let script_hosts = server_list.script_hosts

  let success:boolean = false 
  while(!success) {
    success = findScriptHostAndRun()
    if (!success) ns.print( `failed to run ${script_to_run_name} on any script hosts, trying again`)
    await ns.sleep( 1000 )
  }

  // --- main.functions ---
  function findScriptHostAndRun():boolean {
    let sh = new ServerList(ns)
    let hacked_servers = sh.all_servers.filter(s=>s.hasAdminRights)

    for( let script_host of hacked_servers) {
      let ram_available = script_host.maxRam - script_host.ramUsed
      if ( ram_available > script_ram_required ) {
        let pid = ns.exec( script_to_run_name, script_host.hostname, threads, ...script_args )
        ns.print(`${script_to_run_name} running on ${script_host.hostname} -t ${threads} ${JSON.stringify(script_args)}`)
        return true
      } else {
        ns.print(`${script_to_run_name}(${script_ram_required}) cant run on ${script_host.hostname}(${ram_available})`)
      }
    }
    return false
  }
}