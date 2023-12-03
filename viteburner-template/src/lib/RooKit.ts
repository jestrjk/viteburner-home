/* eslint-disable */
import { colors } from "./utils"
import {NS, Server} from "../NetscriptDefinitions"

export class RootKit {
  ns: NS
  port_hacker : PortHackingPrograms 
  target_server: Server
  
  constructor( ns: NS, target_server: Server ) {
    this.ns = ns
    this.port_hacker    = new PortHackingPrograms( ns ) ;
    this.target_server  = target_server
  }

  /** run method returns try on rootkit success, false otherwise */
  run () {
    if ( this.target_server.hasAdminRights ) return true

    let hack_level = this.ns.getHackingLevel()
    //this.ns.print( `hacking ${hack_level} / ${this.target_server.requiredHackingSkill??9999999}`)

    if ((this.target_server.requiredHackingSkill ?? 9999999) > hack_level  ) return false
    //this.ns.print( `passed hacking level check`)

    this.port_hacker.run( this.target_server.hostname )
    this.target_server = this.ns.getServer( this.target_server.hostname )

    if ( (this.target_server.numOpenPortsRequired ?? 0) > ( this.target_server.openPortCount ?? 0) ) {
      this.ns.print( `ERROR ports_open/ports_required: ${colors.brightRed}${this.target_server.openPortCount} / ${this.target_server.numOpenPortsRequired}` )
      return false
    }

    this.ns.nuke(this.target_server.hostname) 
    return true
  }

}

export class PortHackingPrograms {
  ns: NS
  program_list: string[]
  active_programs: string[]

  constructor(ns: NS) {
    this.ns = ns ;
    this.program_list = [
      "BruteSSH.exe",
      "FTPCrack.exe",
      "relaySMTP.exe",
      "HTTPWorm.exe",
      "SQLInject.exe",
    ]

    this.active_programs = [] ;

    this.get_active_programs() ;
  }

  get_active_programs() {
    for ( const program_name of this.program_list ) {

      if ( this.ns.fileExists( program_name ) ) {
        //this.ns.print( `[port_hacking] ${colors.brightGreen}${program_name}`)
        this.active_programs.push ( program_name ) 
      } else { this.ns.print( `ERROR [port_hacking] ${colors.brightRed}${program_name} does not exist`)} 

    }
  }	

  run( server_name: string ) {
    
    for ( const program_name of this.active_programs ) {
      switch ( program_name ) {
        case "BruteSSH.exe":
          this.ns.brutessh( server_name )
          break;
        case "FTPCrack.exe":
          this.ns.ftpcrack( server_name )
          break;
        case "relaySMTP.exe":
          this.ns.relaysmtp( server_name )
          break;
        case "HTTPWorm.exe":
          this.ns.httpworm( server_name )
          break;
        case "SQLInject.exe":
          this.ns.sqlinject( server_name )
          break;
        default:
          throw new Error( `[${server_name}] Invalid program name to execute: ${program_name} `)
      }
    }
  }
} // /-PortHacking Class-/
