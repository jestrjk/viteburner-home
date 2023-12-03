import {NS} from "../NetscriptDefinitions"
import { ServerPath } from "../lib/ServerPath"

interface ScriptEntry {
  name: string
  args?: (number | boolean | string)[]
  threads: number
  nokill?: boolean
}
export async function main(ns:NS) {
  ns.tail() 
  ns.resizeTail(800, 500)
  let path = new ServerPath( ns, ns.getHostname(), "home" )
  path.goToTarget()

  let script_host_maxram_ratio_desired = .50
  
  if ( ns.args.length === 1 ) { 
    if ( typeof ns.args[0] === "number" ) {
      script_host_maxram_ratio_desired = ns.args[0] 
    } else {
      throw "ERROR You must supply a number if you are trying to set the manual hack max ram ratio"
    }
  }

  if ( !(script_host_maxram_ratio_desired >= 0 && script_host_maxram_ratio_desired <= 1) ) {
    throw "ERROR You must supply a number between 0 and 1, representing a percentage for the hack mem ratio desired"
  }
  ns.tprint( `hackmanual ratio ${script_host_maxram_ratio_desired}`)

  let singularity_hack_manual_script_name = "singularity/hackManual.js"

  let hack_manual_threads = setupSingularityManualHackThreads(ns, singularity_hack_manual_script_name, script_host_maxram_ratio_desired)
  ns.tprint ( `hack manual threads : ${hack_manual_threads}`)

  //if ( hack_manual_threads !== 0 ) hack_manual_threads = <number>ns.args[0] 
  
  let pre_scripts:ScriptEntry[] = [
    { name: "global_data/populate_data.js", threads: 1 },
    { name: "init/prepareScriptHosts.js",   threads: 1 },
  ]

  let scripts:ScriptEntry[] = [
    { name: "dashboard/server_stats.js",    threads: 1 },
    { name: "dashboard/process_watcher.js", threads: 1 },
    { name: "dashboard/money_perSecond.js", threads: 1 },
    
    { name: "singularity/hackManual.js", args: ["--disable_best_select_algorithm"],   threads: 1500, nokill:true },
    { name: "singularity/hackManual.js",                                              threads: 2500, nokill:true },
    { name: "hack/install.js", args:["--disable_hack_calls", "--hack_per_server_limit", "10"],                   threads: 1 },
  ]
  

  await killOldAndRunNewScripts(ns, pre_scripts)
  await ns.sleep( 2000 )
  await killOldAndRunNewScripts(ns, scripts)
  await ns.sleep( 2000 ) 
  ns.closeTail()
}

function setupSingularityManualHackThreads(ns: NS, singularity_hack_manual_script_name: string, script_host_maxram_ratio_desired: number) {
  let script_host_maxram = ns.getServer().maxRam ?? 0
  let hack_manual_mem_required = ns.getScriptRam(singularity_hack_manual_script_name)
  if (hack_manual_mem_required === 0) throw `ns.getScriptRam() could not find ${singularity_hack_manual_script_name}`

  let hack_manual_threads = 0
  hack_manual_threads = Math.floor(script_host_maxram * script_host_maxram_ratio_desired / hack_manual_mem_required)
  ns.print(`${ns.getHostname()} with maxram ${script_host_maxram} requires ${hack_manual_mem_required} for -t ${hack_manual_threads}`)

  if (hack_manual_threads === 0) throw "ERROR Cant computer the number of threads"
  return hack_manual_threads
}

async function killOldAndRunNewScripts(ns: NS, scripts: ScriptEntry[]) {
  let procs = ns.ps()
  for (let script of scripts) {

    if ( !script.nokill ) {   
      let filtered_procs = procs.filter(p => p.filename == script.name)
      
      for (let filtered_proc of filtered_procs) {
        ns.closeTail(filtered_proc.pid)
        ns.kill(filtered_proc.pid)
      }
    }
    ns.tprint( `Running ${script.name} ${script.args??''} ${script.threads} nokill:${script.nokill}`)
    ns.run(script.name, script.threads, ...script.args??[] )
    await ns.sleep(1000)
  }
}
