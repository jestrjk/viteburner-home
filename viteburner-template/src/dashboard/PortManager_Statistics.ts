import {NS} from "../NetscriptDefinitions"
import * as PM  from "../lib/PortManager"

export async function main(ns:NS) {
  ns.tail() 
  let [ window_width, window_height] = ns.ui.windowSize()
  let desired_tail_width = 660
  let desired_tail_height = 100

  let desired_tail_pos_width = window_width - desired_tail_width-200 -5
  let desired_tail_pos_height = window_height - desired_tail_height -5

  ns.tprint( `window size: ${window_width},${window_height}`)
  ns.tprint( `tail pos: ${desired_tail_pos_width},${desired_tail_pos_height}`)

  ns.moveTail(desired_tail_pos_width, desired_tail_pos_height)
  ns.resizeTail(desired_tail_width,desired_tail_height)
  
  ns.clearLog()

  PM.clearPortManagers(ns)  

  while(true) {
    ns.clearLog()
    let pm = PM.getPortManager(ns, PM.PortNumbers.liteScriptResults)
    let stats = pm.getMonitoringStats()
    let port_numbers = pm.portNumbers
    ns.print( header() )
    
    let seconds = Math.floor( (stats.elapsed_time / 1000) % 60 ) 
    let minutes = Math.floor( (stats.elapsed_time / 1000 / 60) % 60 )
    let hours   = Math.floor( (stats.elapsed_time / 1000 / 3600) % 60 )
    let days    = Math.floor( (stats.elapsed_time / 1000/ (3600*24)) )
        
    let tf = (value:number) => value.toString().padStart( 2 , "0")

    ns.print(
      `port:${pm.portNumbers.toString()}`.padEnd(12) +
      `${tf(days)}:${tf(hours)}:${tf(minutes)}:${tf(seconds)}`.padEnd(16) +
      `${stats.peeks}`.padEnd(6) +
      `${stats.reads}`.padEnd(8) +
      `${stats.reads_per_second.toFixed(1)}`.padEnd(8) +
      `${stats.writes}`.padEnd(8) +
      `${stats.writes_per_second.toFixed(1)}`.padEnd(8) +
      ``
    )

    await ns.asleep(1000) 

    function header():string {
      let header = 
        `port` .padEnd(12) +
        `elapsed_time`.padEnd(16) +
        `peeks`.padEnd(6) +
        `reads`.padEnd(8) +
        `reads/s`.padEnd(8) +
        `writes`.padEnd(8) +
        `writes/s`.padEnd(8) +
        ``
      return header
    }
  }
 
}