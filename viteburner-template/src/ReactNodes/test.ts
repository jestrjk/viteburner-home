import { NS } from '@ns'
import {TestMessage} from './TestMessage' 
import ReactType from 'react'

declare var TM:  typeof TestMessage
declare var React:        typeof ReactType

export async function main (ns:NS) {
  ns.tail()
  let data = {
    name: "PooHeah"
  }  

  while (true){
    ns.clearLog()

    ns.printRaw( TestMessage( data ) )

    await ns.sleep(2000)
  }
}

interface PageData {
  button_text: string
  testMessage: string
}
const data:PageData = {
  button_text: "Anthony",
  testMessage: "Ello Der",
}

// function TestMessage(data:PageData) {
//   return React.createElement(
//     "div",
//     null,
//     `Literal:`,
//     React.createElement("b", null, data.testMessage),
//     React.createElement( "button", {onClick:()=>{data.button_text += "Sucks" }, style: {height: "50px",width: "100px"}}, data.button_text),
//     `Done !`
//   ) 
// }
