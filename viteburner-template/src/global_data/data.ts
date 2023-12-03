import { Player, Server } from "../NetscriptDefinitions"
import { ServerList } from "../lib/ServerList"

export interface ServerAnalysisData {
  hostname:                   string
  weakenAnalyseData:          number
  growthAnalyzeData:          number
  hack_time_required:         number
  hack_money_ratio_stolen:    number
  hack_success_chance:        number
  hack_threads_for_75percent: number
  grow_time_required:         number
}

export interface ServerAnalysis {
  [key:string]: ServerAnalysisData
}

export interface ServerDiff {
  hostname: string
  diff_summary: string
  time_to_live: number
  timestamp: number
}

export interface SingularityAction {
  pid:              number
  target_hostname:  string
  action:           string
  ttl:              number
}

export interface GlobalData {
  server_list: ServerList
  server_analysis: ServerAnalysis 
  player: Player
  server_diffs: ServerDiff[]
  singularity: {
    current_server: string
    current_actions: SingularityAction[]
  }

}

export class DataBroker {
  constructor() { }

  get all_servers():Server[] {
    return data.server_list!.all_servers
  }
  get script_hosts(): Server[] {
    return data.server_list!.script_hosts
  }
  get data(): GlobalData {
    return <GlobalData>data
  }
  getServerData(hostname:string): Server {
    return <Server>data.server_list?.all_servers.filter(s=>s.hostname == hostname)[0]
  }
  getAnalysisData( hostname:string ): ServerAnalysisData {
    return data.server_analysis![hostname]
  }
}

export const data:Partial<GlobalData> = {
  singularity: {
    current_server: "home",
    current_actions: [],
  },
  server_diffs: [],
  server_analysis: {},
}

