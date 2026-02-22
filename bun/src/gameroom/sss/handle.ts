//warning not used at the moment. Was experimenting with syntax of the cell sequences collect. The ccc.test.ts demonstrated the syntax works
import type { WebSocketData } from "../..";

/** to avoid black magic in cell_chain_control declaration and tests */
type CellCallback = (col: number, row: number) => void;


export function client_click_command(
  ws:Bun.ServerWebSocket<WebSocketData>,
  dest_col:number,
  dest_row:number,
  orig_col:number,
  orig_row:number
) {
  cell_chain_control(dest_col, dest_row, orig_col, orig_row, (x, y) => {
    // todo single_cell_update_ws_message_to_client(ws, x, y, newState); or so. This is the body of the callback in production. Just sender if possible, all logic should be implemented below in cell_chain_control
  });
}

/* //todo frist debug this, then extend and consider to refactor to only destination click(maybe store selected cell col row...maybe).*/
/** manages the straight sequence of the gameboard cells.
 * Only vertical or horizontal.
 */
export function cell_chain_control(
  dest_col:   number, dest_row:   number,   // destination cell coordinates, is start of iteration. We start from destination and move reversed to place where playable item stands. To analyze first the destination is it free or not to do step.
  orig_col: number, orig_row: number,   // piece origin, this one is last, to check destination first
  callback:CellCallback
) {
  const d_col = dest_col - orig_col; //like left-right/horizontal
  const d_row = dest_row - orig_row; // like top-down/vertical

  // todo consider implement the ban, since only horizontal and vertical allowed as destination
  if (d_col !== 0 && d_row !== 0) return;           // not horizontal/vertical

  const horizontal = d_row === 0;
  const steps = horizontal ? Math.abs(d_col) : Math.abs(d_row);  // exact number of cells - 1

  // Direction toward origin. Again , at the moment we start from destination cell.
  const dirX = orig_col < dest_col ? -1 : (orig_col > dest_col ? +1 : 0);
  const dirY = orig_row < dest_row ? -1 : (orig_row > dest_row ? +1 : 0);

  let x = dest_col;
  let y = dest_row;

  // todo Always manages destination first -> origin last. It is good to check the cell is free to step on, otherwise break the loop after first cell(and send NO to client). But in same time the appearing on the client side should be natural from origin to destination. For this the ws messages should be implemented with delay. First one has longest delay. Last one origin cell has no delay or minimal delay(50ms). So finally on client side the sequence of arrived messages will be natural from origin to destination(for animation of the fire etc, when dragon throws the flame or flashes). I feel it like this at the moment.
  for (let i = 0; i <= steps; i++) {
    callback(x,y)
    if (i < steps) {
      x += dirX;
      y += dirY;
    }
  }
}
