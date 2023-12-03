import { createElement } from "react" 

export function TestMessage(testMessage:string) {
  return createElement(
    "div",
    null,
    `Literal:
      ${createElement("b", null, testMessage)}
    Done !`
  ) 
}



