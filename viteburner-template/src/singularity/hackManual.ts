import {NS,Player,Server,ScriptArg} from "../NetscriptDefinitions"
import { ServerPath } from "../lib/ServerPath"
import * as Flags from "../types/Flags"
import { DataBroker } from "../global_data/data"

export type OptionsSchema   = [string, string | number | boolean | string[]][] 
export type FlagsResult     = { [key: string]: ScriptArg | string[] }

interface NetworkNode {
  node_name: string
  child_nodes: NetworkNode[]
}

interface HackTarget {
  player: Player
  hacking_money_ratio: number
  money_available: number
  server: Server
  ratio: number
  hack_success_chance: number
  hack_time: number
}

type AlgorithmIterator = {value: 0}

interface PickBestToHackParams  {
  non_purchased_servers_with_money: Server[]
  last_hack_target_hostname: string
  linear_select_algorithim_iterator: AlgorithmIterator
  options: FlagsResult
}

let optionSchema:Flags.OptionsSchema = [['disable_best_select_algorithm', false],]
let broker = new DataBroker()

export async function main(ns:NS) {
  ns.tail()
  ns.moveTail(1450, 610)
  ns.resizeTail( 1050, 200)
  ns.disableLog( "scan" )

  broker.data.singularity.current_actions = broker.data.singularity.current_actions.filter(a=> ns.pid )

  let options = ns.flags(optionSchema)

  let linear_select_algorithim_iterator:AlgorithmIterator = { value: 0 } // Iterator used when best select algorithm is disabled
  

  let last_hack_target_hostname:string = ''
  while ( true ) {
    
    let non_purchased_servers_with_money = broker.all_servers.filter(s=>!s.purchasedByPlayer&&(s.moneyMax??0) > 0)
    
    let best_to_hack_hostname:string  = pickBestToHack(ns, {
      last_hack_target_hostname,
      linear_select_algorithim_iterator,
      non_purchased_servers_with_money,
      options,
    })

    last_hack_target_hostname= best_to_hack_hostname
       
    let server_path = new ServerPath(ns,broker.data.singularity.current_server, best_to_hack_hostname )
    server_path.goToTarget()
    
    let ttl = Date.now() + Date.now() + 5 * 1000 * 60 
    let new_action = { 
      pid: ns.pid, 
      target_hostname: 
      best_to_hack_hostname, 
      action: "SH",
      ttl,
     }

    broker.data.singularity.current_actions.push(new_action)
    await ns.singularity.manualHack()
    broker.data.singularity.current_actions = broker.data.singularity.current_actions.filter(a=> a.pid != new_action.pid)
  }
}

function pickBestToHack( ns:NS, params: PickBestToHackParams ): string {

  // best_hack_algorithm DISABLED
  if ( params.options.disable_best_select_algorithm ) {
    if ( params.linear_select_algorithim_iterator.value >= params.non_purchased_servers_with_money.length ) 
    { params.linear_select_algorithim_iterator.value = 0 }

    let simple_iterated_hostname:string = params.non_purchased_servers_with_money[params.linear_select_algorithim_iterator.value].hostname

    params.linear_select_algorithim_iterator.value ++

    return simple_iterated_hostname
  }

  // best_hack_algorithm ENABLED
  let player = broker.data.player
  let best_hack_target:HackTarget = {
    player: player,
    hacking_money_ratio: 0,
    money_available: 0,
    server: params.non_purchased_servers_with_money[0],
    ratio: 0,
    hack_success_chance: 0,
    hack_time: 1,
  }
  
  for( let current_target_server of params.non_purchased_servers_with_money) {
    if ( !current_target_server.hasAdminRights ) continue

    if ( params.last_hack_target_hostname === current_target_server.hostname ) {
      ns.print( `Skipping last hack target: ${params.last_hack_target_hostname}==${current_target_server.hostname}` )
      continue
    }
    
    let current_hack_target = getHackTarget(ns, player,current_target_server )

    // ns.print( `${current_hack_target.server.hostname}(${current_hack_target.ratio.toFixed(2)}) ` + 
    //   `with ${best_hack_target.server.hostname}(${best_hack_target.ratio.toFixed(2)})`)

    if ( current_hack_target.ratio > best_hack_target.ratio ) {
      // ns.print( `${current_hack_target.server.hostname}(${current_hack_target.ratio.toFixed(2)}) ` + 
      //   `has unseated ${best_hack_target.server.hostname}(${best_hack_target.ratio.toFixed(2)})`)

      best_hack_target = current_hack_target
    }
  }
  
  return best_hack_target.server.hostname
}

function calculateRatio(ns:NS, server:HackTarget ):number {
  let x = server.hack_success_chance
  let scaled_success = .6*x + .4

  if ( server.money_available < 10000 ) return -5

  server.ratio = (( server.hacking_money_ratio * server.money_available * scaled_success) 
    / (server.hack_time?server.hack_time:1) ) 

  //ns.tprint( `${server.server.hostname.padEnd( 24 )} success:${server.hack_success_chance.toFixed(3).padEnd( 20 )} scaled:${scaled_success.toFixed(3).padEnd(20)} ratio:${server.ratio.toFixed(3).padEnd(20)}`)

  return server.ratio
}

function getHackTarget(ns:NS, player:Player, target_server:Server):HackTarget {

  let server_analysis = broker.data.server_analysis[target_server.hostname]

  let hack_target_hostname              = target_server.hostname
  let hack_target_hacktime              = server_analysis.hack_time_required
  let hack_target_success_chance        = server_analysis.hack_success_chance
  let hack_target_money_ratio           = server_analysis.hack_money_ratio_stolen
  let hack_target_available_money       = target_server.moneyAvailable??0
  
  let hackTarget:HackTarget = {
    player,
    server:               target_server,
    ratio:                -1,
    money_available:      hack_target_available_money,
    hacking_money_ratio:  hack_target_money_ratio,
    hack_time:            hack_target_hacktime,
    hack_success_chance:  hack_target_success_chance,
  }
    
  // if ( hack_target_success_chance < .6 ) {
  //   return hackTarget
  // } 
  
  calculateRatio( ns, hackTarget )

  return hackTarget
}

export function autocomplete(data:any, args:any) {
  data.flags(optionSchema)
  return [data.flags]
}

