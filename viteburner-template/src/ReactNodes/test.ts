import { NS } from '@ns'
import { TestMessage } from '@/ReactNodes/TestMessage'

export async function main (ns:NS) {
  ns.printRaw( TestMessage( "Hi, this is a test!"))
}