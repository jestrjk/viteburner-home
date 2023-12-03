/* eslint-disable */
import { NS, Server } from '../NetscriptDefinitions'

export class ServerList {
  constructor(ns:NS){
    this.ns = ns
    
    this.buildAllServers()
    this.buildScriptHosts()
    this.getUtilityHosts()
  }

  private ns:NS
  all_servers:Server[] = []
  script_hosts: Server[] = []
  utility_hosts: Server[] = []

  private buildAllServers() {
    this.recursiveServerScan('home')
  }

  private getUtilityHosts() {
    this.utility_hosts = this.all_servers.filter(s=>s.purchasedByPlayer && s.hostname.startsWith("utility-"))
  }

  private buildScriptHosts() {
    this.script_hosts = this.all_servers.filter((s=>s.purchasedByPlayer && !s.hostname.startsWith( "utility-scripts")))
  }

  private recursiveServerScan(parent_host_name = 'home'): void {
    let new_server_names = this.ns.scan( parent_host_name )
  
    for ( let new_server_name of new_server_names ) {
      if ( this.all_servers.filter( s=>s.hostname == new_server_name ).length > 0) {
        continue;
      } else {
        this.all_servers.push( this.ns.getServer( new_server_name ) )
        this.recursiveServerScan( new_server_name )
      }
    }
  }

}


  
