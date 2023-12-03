/* eslint-disable */
import {NS} from "../NetscriptDefinitions"
import * as PortManager from "./PortManager";

export async function main(ns:NS) {
  ns.tail()

  let pm = new PortManager.PortManager(ns, PortManager.PortNumbers.liteScriptResults)

  await ns.sleep(100)

  let write = () => pm.writeJSONPort( data() )
  let read = ()  => pm.readJSONPort()
  let report = () => ns.print( JSON.stringify(pm.getMonitoringStats(), null, 1 ) )
  
  write()
  write()
  write()
  report()
  await randomsleep()
  write()
  write()
  read()
  read()
  write()
  report()
  await randomsleep()
  write()
  write()
  write()
  read()
  read()
  report()
  await randomsleep()

  for( let i=0; i<10000;i++ ){
    write()
    read()
  }

  report()
  

  function data() {
    return { a:Math.random(), b:Math.random() }
  }

  async function randomsleep() {
    await ns.sleep( Math.random()*1000*5 )
  }

}