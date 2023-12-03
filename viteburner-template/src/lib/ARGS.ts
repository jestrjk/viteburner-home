
interface ArgumentOption {
  option_name:string
  type: "string" | "number" | "boolean"
  value:string|number|boolean
  desc?: string
}

type NSArg = string | boolean | number

export class ARGS {
  constructor(NS_Arguments:NSArg[] , argSchema: ArgumentOption[] ) {
    this.NS_args = NS_Arguments
    this.argSchema = argSchema
  }

  NS_args: NSArg[]
  argSchema: ArgumentOption[]

  process() {
    
    for ( let arg_option of this.argSchema ) {
      if ( this.NS_args.includes(arg_option.option_name) ) {
        
      }
    }

  }//process

}