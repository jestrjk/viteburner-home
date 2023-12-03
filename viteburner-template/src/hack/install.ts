/* eslint-disable */
import {NS, Server, AutocompleteData } from "../NetscriptDefinitions"
import {colors, disableNSFunctionLogging} from "../lib/utils"
import { DataBroker } from "../global_data/data"

let optionsSchema:any = [
	['hack_per_server_limit', 1],
	['disable_hack_calls', false],
	['help', false],
]

let hack_script_names = {
	weaken: "hack/weaken.js",
	grow: "hack/grow.js",
	hack: "hack/hack.js",
}

export interface ErrOptions {
	ns:NS
	script_host_name:string
	target_server_name:string
}
let broker = new DataBroker() 

export async function main(ns:NS) {
	ns.tail()
	ns.moveTail( 200, 0 )
	ns.resizeTail( 450, 300)
	
	disableNSFunctionLogging(ns)

	let { options, optionsArgs, optionsTargets } = getOptions(ns)

  ns.tprint(  options )
	ns.tprint(  optionsArgs )

	await ns.sleep( 1000 )
	while ( true ) {

		let { target_servers, all_servers }: { target_servers: Server[]; all_servers:Server[] } = getServerLists(broker)
		if ( optionsTargets.length > 0 ) target_servers = target_servers.filter( s=> optionsTargets.includes( s.hostname ))
		
		ns.print( `target_servers: ${JSON.stringify( target_servers.map(s=>s.hostname))}`)

		// Start da haxoring!
		for( let target_server of target_servers ) {
			//ns.clearLog()

			let { script_host, target_server_name, script_hosts } = getScriptandTargetBaseInfo(all_servers, ns, broker, target_server)

			if ( !target_server.hasAdminRights ) continue;
			let target_max_money 			=	ns.getServerMaxMoney( target_server.hostname )
			if ( target_max_money <= 0 ) continue ;

			ns.print( `[${script_host.hostname}] ram ${script_host.maxRam-script_host.ramUsed}`)

			if ( ! ns.serverExists( script_host.hostname ) ) { 
				ns.print( `[${target_server.hostname}] ${script_host.hostname} does not exist`); 
				continue; 
			}

			let target_money 							=	ns.getServerMoneyAvailable( target_server_name )
			
			let target_min_security 			= ns.getServerMinSecurityLevel( target_server_name )
			let target_current_security 	= ns.getServerSecurityLevel( target_server_name ) 

			ns.print( `[${script_host.hostname}] checking ${target_server_name}` )
			
			let errOptions:ErrOptions 	= getErrOptions( ns, script_host, target_server_name) 
			let server_analysis					= broker.getAnalysisData(target_server_name)

			// Script conditions
			if ( target_current_security >= 10 + target_min_security ) {
				let weaken_time 						= ns.getWeakenTime( target_server_name )
				let weaken_amount 					= server_analysis.weakenAnalyseData
				let weaken_threads 					= 1000 ; 		// TODO TODO TODO Fix this to dynamic calc

				exec_script( script_host, script_hosts, target_server_name, hack_script_names.weaken, weaken_threads, weaken_time  )
			} else { err( errOptions, "weaken()" ) }

			if ( target_money < .8 * target_max_money ) {

				let grow_time 							= server_analysis.grow_time_required
				let growth_threads 					= server_analysis.growthAnalyzeData
				
				exec_script( script_host, script_hosts, target_server_name, hack_script_names.grow, growth_threads, grow_time )
			} else{ err( errOptions, "grow()" )}
			
			if ( options.disable_hack_calls ) { 
				ns.print( `Hack calls disabled` )
			} else {
				if ( target_money >= .8 * target_max_money ) {
					let hack_time 			= ns.getHackTime( target_server_name )
					let hack_threads   = Math.max( Math.floor( ns.hackAnalyzeThreads(target_server_name, Math.floor( target_max_money*.75 ))) , 1)
					
					exec_script( script_host, script_hosts, target_server_name, hack_script_names.hack, hack_threads, hack_time )
				} else{ err( errOptions, `hack() money: ${ns.formatNumber(target_money,1)} / ${ns.formatNumber(target_max_money,1)} }`)}
			}
			
			ns.print( `${colors.white}End script hosts`)
		} // for target_servers 
		ns.print(`${colors.white}End target servers `)
		await ns.sleep ( 50 )
	} // while true

	// ------- Function Definitions -------
	// function defs main->fn

	function numberOfSimliarScriptsRunning(script_name:string,target_server_name: string):number{
		
		let count_of_similar_scripts = 0 
		for ( let other_script_host of broker.script_hosts ) {
			//ns.print( `Checking if any hack scripts running on ${other_script_host.hostname}`)

			if ( ns.scriptRunning( script_name, other_script_host.hostname )) {
				ns.print( `Found scripts running on ${other_script_host.hostname}`)
				let ps = ns.ps( other_script_host.hostname )
				// ns.print( ps )
				count_of_similar_scripts += ps.filter( proc=>(
					proc.filename.startsWith( "hack" ) &&
					proc.args.includes(target_server_name))
				).length

			}//for
		}//for
		return count_of_similar_scripts
	} //function

	function exec_script( script_host: Server, script_hosts: Server[], target_server_name: string, 
		script_name: string, threads_required: number, time_required: number = -1 ):boolean	 {
		
		let scripts_running = numberOfSimliarScriptsRunning(script_name, target_server_name)
		ns.print( `similar scripts running: ${scripts_running}`)

		if ( scripts_running > <number>options.hack_per_server_limit ) return false

		let host_max_ram   					= ns.getServerMaxRam( script_host.hostname )
		let adjusted_thread_count 	= adjustThreadCount( ns, script_host.hostname, host_max_ram, script_name, threads_required )
		if ( adjusted_thread_count < 1 ) {
			err( {ns,target_server_name,script_host_name: script_host.hostname}, `host OOM: ${host_max_ram}`)
			return false
		}

		adjusted_thread_count = Math.floor( adjusted_thread_count )

		ns.print( `WARNING EXEC ${script_host.hostname}=>${target_server_name} with ${script_name}(t=${adjusted_thread_count})`)
		ns.exec(script_name, script_host.hostname, adjusted_thread_count, target_server_name, Date.now(), time_required )
		return true ;
	}

	
} // main

function getOptions(ns: NS) {
	let options:any = ns.flags(optionsSchema)

	if (options.help) {
		ns.tprint(optionsSchema)
		ns.closeTail()
		ns.exit()
	}

	let optionsArgs: string[] = [options._].flat()
	let optionsTargets: string[] = []
	if (optionsArgs.length > 0) optionsTargets = optionsArgs
	
	return { options, optionsArgs, optionsTargets }
}

function adjustThreadCount( ns: NS, script_host_name: string, host_max_ram: number, script_name: string, threads: number ) {

	let used_ram = ns.getServerUsedRam( script_host_name )
	let ram_per_thread = ns.getScriptRam(script_name) 

	while ( !hostHasEnoughRam( ns, ram_per_thread, host_max_ram, used_ram, threads)) {
		if ( threads < 3 ) return 1
		threads *= .95
	}

	return Math.floor( threads ) //adjusted thread count due to ram available
}

function hostHasEnoughRam( ns:NS, ram_per_thread: number, host_max_ram: number, used_ram: number,  threads: number ) {
	// ns.print( `Checking if host ram/thread*threads(${(ram_per_thread*threads).toFixed(1)}) < total ram(${host_max_ram}-${used_ram})`)
	if ( (ram_per_thread * threads) < ( host_max_ram - used_ram  ) ) {
		return true ; 
	} else { return false }
}

function err( opts:ErrOptions, msg:string ){ 
	opts.ns.print(`ERROR [${opts.script_host_name}]=>[${opts.target_server_name}] ${msg}`) 
}

function getServerLists(broker: DataBroker) {

	let all_servers = broker.all_servers.slice(0).reverse()
	let target_servers = all_servers.slice(0)

	return { target_servers, all_servers }
}

function getScriptandTargetBaseInfo(all_servers: Server[], ns: NS, broker: DataBroker, target_server: Server) {
	let script_hosts = all_servers.filter(h => h.hasAdminRights)
	ns.print(`INFO Script Hosts ${script_hosts.length}/${broker.script_hosts.length}`)
	script_hosts.sort((a, b) => a.maxRam - b.maxRam)

	let target_server_name = target_server.hostname

	let priority_script_hosts = script_hosts.slice(0).sort((a, b) => (b.maxRam - b.ramUsed) - (a.maxRam - a.ramUsed))
	let script_host = priority_script_hosts[0]
	return { script_host, target_server_name, script_hosts }
}
	
function getErrOptions(ns:NS, script_host: Server, target_server_name: string): ErrOptions {
	return {
		ns,
		script_host_name: script_host.hostname,
		target_server_name
	}
}

export function autocomplete(data:AutocompleteData, args:any) {
	data.flags(optionsSchema)
  return [ ...data.servers, ...data.scripts, data.flags ]
}