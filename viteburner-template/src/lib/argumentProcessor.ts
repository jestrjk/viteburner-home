/* eslint-disable */
import {NS} from "../NetscriptDefinitions"

interface Arguments {
	options: { [key: string]: string }
	args: (number | string)[]
}

export function processArguments( ns:NS ) {
	let args = ns.args ;

	let processed_args: Arguments = {
		options:  {},
		args:			[]
	} ;

	for( let i = 0 ; i < ns.args.length ; i++ ) {
		
		let arg = ns.args[i] 

		if ( Number.isInteger( arg ) ) {
			//processed_args.args.push( arg )
			continue
		}		

		if ( arg.toString().startsWith('--') ) {
			let new_option_key = arg.toString().slice(2) 
			let new_option_value = ns.args[i+1]
			i++

			//processed_args.options[new_option_key] = new_option_value
			continue
		} else {
			//processed_args.args.push( arg ) 
		}
	}

	return processed_args
}