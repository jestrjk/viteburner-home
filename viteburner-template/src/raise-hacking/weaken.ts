import { NS } from "../NetscriptDefinitions";

export async function main ( ns:NS ) {
  ns.tail() 
  ns.moveTail( 1000, 600 )

  let target:string = <string>ns.args[0]
  
  while (true) {
    await ns.weaken(target)
  }
}

export function autocomplete( data:any, args:any ) {
  return [...data.servers]
}