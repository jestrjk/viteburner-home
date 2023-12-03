/* eslint-disable */
import {NS, PortData} from "../NetscriptDefinitions" 
import { colors, disableNSFunctionLogging } from "../lib/utils"

export async function main ( ns: NS ) {
  ns.tail()
  ns.moveTail(1800, 400)
  ns.clearLog()
  disableNSFunctionLogging(ns)

  let base_ram = 1
  let server_sizes: number[] = []

  for ( let i = 0 ; i < 20; i++ ) {
    server_sizes.push( base_ram *= 2 )
  }

  let Commands = {
    buy:              'Buy a new Purchased Server',
    buy_costs:        'Get buy costs for Purchased Servers',
    list_purchased:   'List Purchased Servers',
    upgrade:          'Upgrade a Purchased Server',
    upgrade_cost:     'Get upgrade Cost for a Purchased Servers',
    rename:           'Rename your Purchased Server',
    exit:             'exit',
  }

  // PROMPT LOOP
  while (true) {
    let options = ns.flags([["auto", false],["size", 64]])
    ns.print( options )

    let choice = await ns.prompt( "Choose your Action:", { type: "select", choices: Object.values(Commands)})
    ns.print( `Choice Selected: ${choice}`)
   
    switch ( choice ) {
      case Commands.buy_costs:
        printPurchasedServerCosts() ;      
        break ;
      case Commands.rename:
        ns.renamePurchasedServer(await askPurchasedServerName("RENAME"), await askServerName("RENAME") ); 
        break ;
      case Commands.buy:
        await buy() ;
        break ;
      case Commands.upgrade:
        await upgrade() ;
        break ;
      case Commands.upgrade_cost:
        printMyPurchasedServers()
        await upgrade_cost() ;
        break ;
      case Commands.buy_costs: 
        printPurchasedServerCosts() ;
        break ;
      case Commands.list_purchased:
        printMyPurchasedServers() ;
        break ;

      case Commands.exit:
        ns.closeTail()
        ns.exit() ;
      default: 
        ns.print( `ERROR: not a valid command: ${choice}`)
        ns.print( Commands )

    }// while PROMPT LOOP
  }// main:while(true)

  // ASK Functions
  async function askServerName(title_prefix:string) {
    return await ns.prompt( `${title_prefix}: Please select a server name.`,
     {type: "text"}) as string
  }

  async function askRam(title_prefix:string): Promise<number> {
    let ram_choice = Number.parseInt(await ns.prompt( `${title_prefix}: Select the amount of ram:`, { 
        type: "select", 
        choices: server_sizes.map(s=>s.toString()) 
      }
    ) as string )   

    return ram_choice
  }

  async function askPurchasedServerName(title_prefix:string): Promise<string> {
    let purchased_servers = ns.getPurchasedServers()
    if ( purchased_servers.length == 0 ) { 
      ns.print( `ERROR: No purchased servers`) 
      return '' ;
    }

    let name = await ns.prompt( `${title_prefix}: Choose the purchased server:`,
      {type:"select", choices: purchased_servers})
    
      return name as string
  }

  // COMMAND functions
  async function upgrade() {
    let hostname: string  = await askPurchasedServerName("UPGRADE")
    let ram: number       = await askRam("UPGRADE")

    let isSuccess = ns.upgradePurchasedServer( hostname, ram ) 
        
    printMyPurchasedServers()
  }
  
  async function buy() {
    printPurchasedServerCosts()
    printMyPurchasedServers()
    
    let host_name_new_server = ns.purchaseServer(await askServerName("BUY"), await askRam("BUY"))

    if (host_name_new_server)   ns.print( `PURCHASE attempt: ${host_name_new_server ? "succeeded" : "failed"}`)
    if (!host_name_new_server)  ns.print( `ERROR purchase failed`)

    printMyPurchasedServers()
  }

  function printPurchasedServerCosts() {
    let money = ns.getPlayer().money

    ns.print( title(`Server Costs`))
    for ( let size of server_sizes ) {
      let cost = ns.getPurchasedServerCost( size ) 

      ns.print( `${size.toString().padStart(5).padEnd( 8)} ${color_range(money, cost)}${ns.formatRam( size, 1 ).padEnd(10)} ${ns.formatNumber( cost ) }`)
    }

  }

  function printMyPurchasedServers() {
    ns.print( title(`Purchased Servers`))
    for ( let purchased_server_name of ns.getPurchasedServers() ) {
      ns.print( `${purchased_server_name.padEnd(20)} ${ns.formatRam( ns.getServerMaxRam( purchased_server_name ) )}`)
    }
  }

  async function upgrade_cost() {
    printMyPurchasedServers()

    let hostname: string  = await askPurchasedServerName("UPGRADE COST")
    let ram: number       = await askRam("UPGRADE COST")
    
    let cost = ns.getPurchasedServerUpgradeCost( hostname, ram ) 
    ns.print( `${colors.brightBlue}Cost to upgrade ${hostname} to ${ns.formatRam(ram)}: ${ns.formatNumber(cost, 1)}`)
  }

  // Utilities
  function color_range( money:number, money_cost:number ):string {
    let money_left = money-money_cost

    if ( money_left < 0 ) { return `${colors.brightRed}`}
    if ( money_left < (.75*money) ) { return `${colors.brightYellow}`}

    return ''
  }

  function title(title: string) { return `---------- ${title} -----------` }

} //main

