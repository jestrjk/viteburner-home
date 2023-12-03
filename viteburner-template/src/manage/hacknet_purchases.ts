/* eslint-disable */
import { NS } from "../NetscriptDefinitions";

//                MAIN
export async function main ( ns:NS ) {
  ns.tail()

  let options = ns.flags([["exit", false]])

  if ( options.exit ) {
    ns.print ( `found exit!: ${options.exit }`)
  }else { ns.print( `did not find exit!`)}
  ns.print ( options ) 
  
  
  // while(true) {
  //   ns.clearLog()

  //   let player_money = () => { return ns.getPlayer().money }
  //   let number_of_current_nodes = ns.hacknet.numNodes()

  //   ns.print( `hacknet node count: ${ns.hacknet.numNodes()}`)
  //   ns.print( `Trying to upgrade`)
  //   for ( let i=0 ; i < number_of_current_nodes  ; i++ ) {
  //     ns.print( `try to upgrade ${ns.hacknet.getNodeStats(i).name}`)
  //   }
    

  //   if ( player_money() < ns.hacknet.getPurchaseNodeCost() ) {
  //     ns.print( `Purchasing new hacknet node`)
  //     //ns.hacknet.purchaseNode()
  //   }

  //   await ns.sleep(5000)
  // }
  
}