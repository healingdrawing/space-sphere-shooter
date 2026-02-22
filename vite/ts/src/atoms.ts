import { atom, createStore } from 'jotai'

export const store = createStore()

export const ws_atom = atom<WebSocket | null>(null)
//export const view_atom = atom<CVT>(CVT.HOME)

/** storage for last sent message to easily monitor the messages sent to chat.
 * The planned implementation is next:
 * - client press button "send message"
 * - before send message, the message text stored in atom
 * - after client send message the button "send message" becomes locked
 * - after the message with the same text arrived to client, the message pause countdown started
 * - after pause is over, the "message button" becomes active again
 * - this allows to client to pass server pause for message and not be banned
 * - in same time text managed on client side, to compare and start countdown
 * Fast change of connected users can raise situation when client pause started
 * and in time of the pause the limit changed, to longer time. For this case
 * reset(unlock "send message" button) should be implemented.
 */
export const chat_last_sent_text_atom = atom<string>('')
const chat_history_limit_atom = atom<number>(10) // 0 - unlimited //todo not implemented

/** get maximum number of messages in chat history */
export function get_chat_history_limit(){ return store.get(chat_history_limit_atom) }

/** set maximum number of messages in chat history */
export function set_chat_history_limit(v:number){ store.set(chat_history_limit_atom, v) }

/** how many chat history messages displayed on screen at the moment */
const chat_history_size_atom = atom<number>(0)

/** set counter of messages in current chat history, and return the v */
export function set_chat_history_size(v:number){
  store.set(chat_history_size_atom, v)
  return v
}

/** set chat_history_size_atom value to 0 */
export function reset_chat_history_size(){ set_chat_history_size(0) }

/** increment by 1 the counter of messages in current chat history, and return the current value */
export function increment_chat_history_size(){
  return set_chat_history_size(store.get(chat_history_size_atom) + 1)
}

/** decrement by 1 the counter of messages in current chat history, and return the current value */
export function decrement_chat_history_size(){
  return set_chat_history_size(store.get(chat_history_size_atom) - 1)
}
