/* eslint-disable */
import { NS } from "../NetscriptDefinitions";
import { colors } from "../lib/utils"

export async function main ( ns:NS ) {
  ns.tail() 
  ns.moveTail( 0,0 )
  ns.resizeTail( 300, 60 )
  ns.disableLog( "sleep" )

  while ( true ) {
    
    let c       = colors
    let player  = ns.getPlayer() ;
    let money   = ns.formatNumber( player.money, 3)
    let hack    = player.skills.hacking
    let m       = player.mults

    //ns.print( player ) 
    ns.setTitle( `${player.location}` )
    ns.print( `$${c.brightGreen}${money} ${c.magenta}${hack}` )

    await ns.sleep(2000)
  }//while true

}//main