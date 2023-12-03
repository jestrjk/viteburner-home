import {NS} from "../NetscriptDefinitions"

interface DotInfo {
  dots: string[]
  idot: number
}

interface Difference {
  money: number
  diff: number
  timestamp: number
}

export async function main(ns:NS) {
  ns.tail()
  
  let ROLLING_TIME_SECONDS = 20

  let [ window_width, window_height] = ns.ui.windowSize()
  let desired_tail_width    = 250
  let desired_tail_height   = 140
  ns.moveTail(window_width-desired_tail_width, window_height-desired_tail_height-5)
  ns.resizeTail(desired_tail_width,desired_tail_height)

  ns.disableLog( "asleep")
  ns.disableLog( "sleep")
  
  let dot_info:DotInfo = {
    dots: ["/","-","\\","|"],
    idot: 0
  }
  
  let difference_history:Difference[] = []
  while ( true ) {
    ns.clearLog()
    
    let player = ns.getPlayer()
    let money_difference = 0

    if ( difference_history.length < 2 ) {
      difference_history.push( {
        money: player.money,
        diff: 0,
        timestamp: Date.now(),
      })
    } else {
      money_difference = player.money - difference_history[difference_history.length-1].money
      let current_difference:Difference = {
        money: player.money,      
        diff: money_difference,
        timestamp: Date.now(),
      }
      difference_history.push( current_difference )
    }

    difference_history = difference_history.filter(d=>(Date.now()-d.timestamp) < (ROLLING_TIME_SECONDS*1000) ) 
    let difference_by_age: number[] = []
    for ( let diff of difference_history ){
      let age_in_seconds = ((Date.now() - diff.timestamp)/1000)
      age_in_seconds = age_in_seconds?age_in_seconds:1

      let diff_by_age    = (diff.diff / age_in_seconds)
      // ns.print( `age_in_seconds: ${age_in_seconds} diff_by_age: ${diff_by_age}`)
      difference_by_age.push( diff_by_age )
    }
    // ns.print( `diff_by_age: ${difference_by_age}` ) 
    let cumlative_diff_per_rolling_time = difference_by_age.reduce((p,c)=>p + c) 
    let hacking = player.skills.hacking
    
    p( `Money   : ${ns.formatNumber(player.money)}`)
    p( `Money/s : ${ns.formatNumber(cumlative_diff_per_rolling_time,1)}/${ROLLING_TIME_SECONDS}s ${NaN?`(NaN)`:``} ${printDot(ns,dot_info)}`)
    p( `Karma   : ${player.numPeopleKilled *3}/54000` ) 
    p( `Hacking : ${hacking}` )

    await ns.asleep( 2000 )
  }//while(true)

  // FUNCTIONS
  
  function printDot(ns:NS, dot_info:DotInfo ) {
    dot_info.idot++ 
    if ( dot_info.idot >= dot_info.dots.length ) dot_info.idot = 0
    return dot_info.dots[dot_info.idot]
  }
  
  function p(msg:string){
    ns.print( msg ) 
  }
 }// main

function js( value:object, digits?:number ) {
  return JSON.stringify(value, null, digits)
}