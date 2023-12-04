import React from 'react'

export interface DataObject {
  name: string
}

export function TestMessage(data:DataObject) {

  return (
    <div><div>{data.name}</div>
    <i>is sucks.</i>
    </div>
    
  ) 
}




