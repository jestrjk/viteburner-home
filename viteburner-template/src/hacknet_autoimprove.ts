import {NS} from "./NetscriptDefinitions"

interface HacknetNodeInformation {
  index:number
  level_upgrade_cost: number
}

export async function main (ns:NS) {
  ns.tail()
  let args = ns.flags([
    ["limit", 3]
  ])

  while(true) {
    ns.clearLog()
    let numNodes = ns.hacknet.numNodes()

    for ( let ni = 0 ; ni < numNodes; ni++ ){
      let results = {
        index: ni,
        level: 0,
        level_upgrade: ns.hacknet.upgradeLevel(ni, 5),
        ram: 0,
        ram_upgrade: ns.hacknet.upgradeRam(ni, 1),
        cores: 0,
        cores_upgrade:  ns.hacknet.upgradeCore(ni, 1),
      }

      results.level = ns.hacknet.getNodeStats(ni).level
      results.ram = ns.hacknet.getNodeStats(ni).ram
      results.cores = ns.hacknet.getNodeStats(ni).cores
      ns.print( new Date( Date.now() ).toTimeString())
      ns.print( JSON.stringify( results, null, 1 ) )
    }
    await ns.sleep( 5000 )
  }//while true
}
