import { NS } from "../NetscriptDefinitions";

let optionsSchema:any = [["target", ["megacorp"]]]

export async function main (ns:NS) {
  

  let options = ns.flags( optionsSchema )
  let optionsArgs:any = [options._].flat()

  ns.tprint( JSON.stringify( options, null, 1))

  ns.tprint( optionsArgs )
  ns.tprint( optionsArgs.length )

  // let target = <string>options.target
  // let target_server = 
  // // if ( ns.getServer( target )) {
  // //   let security_diff = server
  // // }
  // while(true) {
  //   await ns.grow( <string>options.target )
  //   await ns.grow( <string>options.target )
  // }
}

export function autocomplete(data:any, args:any) {
  data.flags(optionsSchema)

  return [ ...data.servers, data.flags ]
}