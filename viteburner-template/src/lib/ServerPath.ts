import {NS, Server} from "../NetscriptDefinitions"

export class ServerPath {
  constructor(ns:NS,start_node_name:string, target_node_name: string) {
    this._ns = ns
    this._start_node_name = start_node_name
    this._target_node_name = target_node_name

    if(!this.findPath( start_node_name )) {
      ns.print(`Could not find Path`)
    }
  }

  private _ns:NS
  private _target_node_name:string
  private _start_node_name:string
  private _path: string[] = []
  private _already_visited_names: string[] = []

  get path() {
    return this._path
  }

  get visited() {
    return this._already_visited_names
  }

  goToTarget(target_server_name:string = this._target_node_name) {
    for( let next_server_name_in_path of this._path ){
      this._ns.singularity.connect( next_server_name_in_path ) 
    }
  }
  private findPath(current_node_name:string):boolean {
    if ( this._already_visited_names.includes( current_node_name )){
      //this._already_visited_names.push(`DEAD END`)
      return false;
    } 

    this._already_visited_names.push ( current_node_name )
    this._path.push( current_node_name )

    if ( current_node_name === this._target_node_name ) {
      return true
    }
    
    let child_node_names = this._ns.scan( current_node_name )
    for (let child_node_name of child_node_names){
      
      let found_path = this.findPath(child_node_name) 
      if (found_path) return found_path
    } 
    this._path.pop() 
    this._already_visited_names.push(`DEAD END`)
    return false     
  }
}