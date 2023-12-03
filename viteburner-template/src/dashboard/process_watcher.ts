/* eslint-disable */
import {NS, ProcessInfo, Server} from "../NetscriptDefinitions"
import { DataBroker } from "../global_data/data"
import {ServerList} from "../lib/ServerList"
import { disableNSFunctionLogging } from "../lib/utils"

const config = {
  thread_filter: 5,
}
interface CustomProcessInfo extends ProcessInfo {
  target_server_name:     string
  script_host_name:       string
  run_time:               number
  run_time_date:          Date
  run_time_left:          number
  time_required:          number
  time_required_minutes:  number
  time_required_seconds:  number
}

export async function main ( ns: NS ) {
  let broker = new DataBroker()

  ns.tail() 
  ns.moveTail( 650, 0)
  ns.resizeTail( 750, 500)

  disableNSFunctionLogging(ns)
  ns.clearLog()

  while ( true ) {
    let server_lists          = new ServerList(ns)

    
    let hacked_servers:Server[] = server_lists.all_servers.filter( s=>s.hasAdminRights )

    let script_host_ram_info = getTotalRamUsedAvailable(hacked_servers)

    let proc_data: CustomProcessInfo[] = []
    getExtendedProcessInfo(hacked_servers.map(s=>s.hostname), proc_data)

    let filtered_proc_data = proc_data.filter(p=>p.threads >= config.thread_filter)
    filtered_proc_data.sort( (procA, procB) => (procB.run_time_left - procA.run_time_left) )

    printExtendedProcessData(filtered_proc_data, script_host_ram_info.script_host_ram, script_host_ram_info.script_host_max_ram )

    await ns.sleep( 500 )
  }

  function getTotalRamUsedAvailable(hacked_servers: Server[]) {
    let script_host_max_ram = 0
    let script_host_ram = 0

    for (let hacked_server of hacked_servers) {
      let max_ram = hacked_server.maxRam
      let used_ram = hacked_server.ramUsed
      let available_host_ram = max_ram - used_ram

      script_host_max_ram += max_ram
      script_host_ram += available_host_ram
    }
    return { script_host_max_ram, script_host_ram }
  }

  function printExtendedProcessData(proc_data: CustomProcessInfo[], script_host_ram:number, script_host_max_ram:number ) {
    ns.clearLog()
    proc_data = proc_data.slice(-20)
    for (let proc of proc_data) {

      let countdown = new Date (proc.time_required - proc.run_time)
      let cdm       = countdown.getMinutes().toString().padStart(2,'0')
      let cds       = countdown.getSeconds().toString().padStart(2,'0')
      let rtdm = proc.run_time_date.getMinutes().toString().padStart(2,'0')
      let rtds = proc.run_time_date.getSeconds().toString().padStart(2,'0')
      let trm  = proc.time_required_minutes.toString().padStart(2,'0')
      let trs  = proc.time_required_seconds.toString().padStart(2,'0')

      ns.print(`[${proc.pid}] `.padEnd( 10 ) +
        `${proc.script_host_name}: `.padEnd(20) +
        `${proc.filename.slice(5).slice(0, -3)} `.padEnd(15) +
        `${proc.target_server_name} `.padEnd(18) +
        `(t=${proc.threads})`.padEnd(8) +
        /* `${rtdm}:${rtds}/` +
        `${trm}:${trs}` */
        `${cdm}:${cds}`
      )

    
      
    }
    ns.print( `Hosting RAM: ${ns.formatNumber(script_host_ram,1)}/${ns.formatNumber(script_host_max_ram,1)}`)
  }

  function getExtendedProcessInfo(script_host_names: string[], proc_data: CustomProcessInfo[] ) {
    
    for( let script_host_name of script_host_names ) {
      for (let proc of ns.ps(script_host_name) ) {
        if ( ! proc.filename.startsWith( "hack/") ) continue
      
        let target_server_name  = proc.args[0] as string
        let started_at          = proc.args[1] as number
        let time_required       = proc.args[2] as number

        let time_required_minutes: number = Math.floor(time_required / 60000)
        // subtract the minutes fromor you you get the absolute time required in seconds, not just the seconds "left"
        let time_required_seconds: number = Math.floor(time_required / 1000 - time_required_minutes * 60)

        let now = Date.now()
        let run_time = now - started_at
        let run_time_date = new Date(run_time)
        let run_time_left = time_required - run_time

        proc_data.push({
          ...proc,
          run_time,
          run_time_date,
          run_time_left,
          target_server_name,
          time_required,
          time_required_seconds,
          time_required_minutes,
          script_host_name,
        })

        broker.data.server_diffs.push( {
          hostname: target_server_name,
          diff_summary: proc.filename.split('/')[1],
          time_to_live: time_required,
          timestamp: Date.now(),
        })
      }
    }
  }
}