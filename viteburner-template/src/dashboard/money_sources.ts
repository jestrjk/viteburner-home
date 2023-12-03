/* eslint-disable */
import {NS,MoneySource,MoneySources} from "../NetscriptDefinitions";

export async function main(ns:NS) {
  ns.tail()

  let x:MoneySources = ns.getMoneySources()

  ns.print( JSON.stringify(x,null,1) )
}