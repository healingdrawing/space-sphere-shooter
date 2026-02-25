import { all_handler } from './handlers/all'
import { KEYMAP, mm, MT_NAME } from './tunnel';
import { ram } from './ram'

export const init_ws = (url: string) => {
  
  function manage_byte_array(bar:Uint8Array) {
    // check key arrived
    if(bar.length === 1){
      ram.key = bar[0]
      console.log("key arrived. text:",bar, " ram.key:", ram.key) //todo remove
      return
    }
    const mt = bar[0]//todo refactor properly. here it is not a key, and no keysigned, since sent by server. so mt is first byte
    const text:string = mm.decode(bar.subarray(1));
    console.log('Converted text:', text, ' mt:',MT_NAME[mt as keyof typeof MT_NAME]) //todo remove
  
    all_handler(text, mt)
  }

  const socket = new WebSocket(url)

  socket.onopen = () => {
    console.log('WebSocket connected')
  }
  
  socket.onerror = (error) => {
    console.error('WebSocket connection error:', error)
    alert("Check Connection")
  }

  socket.onclose = () => {
    console.log('WebSocket disconnected')
  }
  
  socket.onmessage = (event) => {
    console.log('Raw received data:', event.data); // Log raw data
    console.log('Data type received:', typeof event.data); // Log data type

    let byte_array:Uint8Array;

    // Case for Blob
    if (event.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = function () {
            if (reader.result instanceof ArrayBuffer) {
                byte_array = new Uint8Array(reader.result);
                console.log('Received byte array from Blob:', byte_array);
            }
            manage_byte_array(byte_array);
        };
        reader.readAsArrayBuffer(event.data);
        return // Exit to wait for the reader.onload
    } 
    // // Case for ArrayBuffer, not used
    // else if (event.data instanceof ArrayBuffer) {
    //   byte_array = new Uint8Array(event.data);
    //   console.log('Received byte array:', byte_array);
    //   manage_byte_array(byte_array);
    // } 
    // // Case for String, not used
    // else if (typeof event.data === 'string') {
    //     byte_array = new Uint8Array([...event.data].map(char => char.charCodeAt(0)));
    //     console.log('Received byte array from string:', byte_array);
    //     manage_byte_array(byte_array);
    // } 
    else {
        console.error('Unexpected data type received:', event.data);
        return // Exit early if the data type is unsupported
    }

    // event.data.text().then((text: string) => {
    //   console.log('Custom on message handler received text:', text)//todo remove
    //   all_handler(text)
    // })
  }

  return socket
}
