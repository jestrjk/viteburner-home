import { NS } from "../NetscriptDefinitions";

export async function main(ns:NS) {
  ns.tail()
  ns.moveTail( 400, 400 )
  ns.singularity.purchaseTor()  
  
  while(true) {

    let programs = ns.singularity.getDarkwebPrograms()
    for( let program of programs ) {
      let cost = ns.singularity.getDarkwebProgramCost( program )
      ns.print( `${program.padEnd( 20 )} $${ns.formatNumber( cost,1)}`)
    }
    
    programs.push( "EXIT" ) 
    let choice:string = <string> await ns.prompt( "What program to purchase from the DarkWeb?", {
      type: "select",
      choices: programs,
    })
    if ( choice === "EXIT" ) {
      ns.closeTail()
      ns.exit()
    } 

    ns.singularity.purchaseProgram(choice)
  }
}

export function autocomplete(data:any, args:any) {
  let results = []
  if ( data.servers ) results.push( ...data.servers )
  if ( data.scripts ) results.push( ...data.scripts )

  return results
}
