import { NS, Server } from "../NetscriptDefinitions";
import { ServerList } from "../lib/ServerList";
import { RootKit } from "../lib/RooKit";
import { colors } from "../lib/utils";

export async function main(ns:NS) {
  ns.tail() 
  ns.moveTail(1700, 990)
  ns.disableLog( "scp" )
  ns.disableLog( "brutessh")
  ns.disableLog( "ftpcrack")
  ns.disableLog( "relaysmtp")
  ns.disableLog( "httpworm")
  ns.disableLog( "sqlinject")
  
  while(true) {
    let sl = new ServerList(ns)
    for( let server of sl.all_servers ) {
      //ns.print( `${colors.brightBlue}${server.hostname}`)
      //ns.print ( sl.all_servers.map( s=> s.hostname) )
      installScripts(ns, server)
      root_server(ns,server)
    }
    await ns.sleep( 1000 )
  }
} // main()

function installScripts( ns: NS,script_host: Server ) {
  if ( script_host.hasAdminRights) {
    let script_names_to_scp = ns.ls('home', ".js")
    if ( ns.scp( script_names_to_scp, script_host.hostname, 'home' ) ) {
      ns.print(`${colors.brightGreen}Success SCP ${script_host.hostname}`) 
    } else {
      ns.print( `ERROR Failed to scp to script_host.hostname`)
    }
  }
}

function root_server( ns:NS, target_server: Server ) {
  if ( target_server.hasAdminRights ) { return true } else {
    let root_kit = new RootKit(ns, target_server ) 
    let rooted = root_kit.run()
    ns.print( `[${target_server.hostname}] rooted: ${rooted}` )
    target_server = ns.getServer(target_server.hostname)
    
    if ( target_server.hasAdminRights ) { return true } else {
      console.log ( `${colors.brightRed} skipping ${target_server.hostname} - could not root kit it`)
      return false
    } 
  }
  //no reach
}