import { NS, ReactNode } from "../NetscriptDefinitions";

export async function main (ns:NS) {
  ns.tail()
  ns.moveTail( 400, 200)
  ns.resizeTail( 400, 150)

  let server_count_limit  = ns.getPurchasedServerLimit()
  let max_ram             = ns.getPurchasedServerMaxRam()
  let cost                = ns.getPurchasedServerCost(max_ram)
  while(true) {

    if ( ns.getPurchasedServers().length >= server_count_limit ) {
      ns.closeTail()
      ns.exit()
    }
    ns.tprintRaw()
    if ( ns.getPlayer().money > cost ) {
      ns.purchaseServer( "sh", max_ram ) 
    }

    ns.print( ns.getPurchasedServers() )

    await ns.sleep( 10000 )
  }
}