import { DEVLOG, devlog, errlog, rawlog } from "../../../debug/debug";
import { type TMDC_CellBackup } from "../types";
import { TMDC_CellState, TMDC_Owner, TMDC_DragonType, TMDC_DragonHP, TMDC_DragonMP, TMDC_DragonRange } from "../enums";
import type { TMDC_BOARD_ACTION, TMDC_BOARD_MESSAGE } from "./types";
import { GameRoomDelayedAction } from "./enums";
import { mm } from "../../../manage/message";

export class TMDCheckersBoard {
  /* to control idle exit game from outside board */
  time_to_check_damage_happen:boolean = false
  private _damage_happen: boolean = false;
  private _step_happen: boolean = false;
  /** return true if any damage happen. Reset to false */
  get_damage_happen_and_reset(){
    const old= this._damage_happen
    this._damage_happen = false
    return old
  }
  /** return true if any step happen. Reset to false */
  get_step_happen_and_reset(){
    const old= this._step_happen
    this._step_happen = false
    return old
  }
  /** return current victory role, based on items condition.
   * At the moment returns 0(no winner) 1 2 (for players).
   * Bot (3) not implemented.
  */
  get_current_victory_role(){
    let role1hp = 0
    let role2hp = 0
    const hp = this.hp
    const ow = this.owner
    const olen = ow.length
    for (let i=1;i<olen;i++) ow[i] === 1?role1hp += hp[i]!:role2hp += hp[i]! //warning unsafe speed
    return role1hp > role2hp?1:role1hp < role2hp?2:0
  }

  private readonly width = 8
  private readonly height = 8
  /** the size of the game room board - width x height */
  readonly size = this.width * this.height
  private readonly sizeplus = this.size + 1

  // warning sizeplus (+1) to avoid to use zero index, let position be natural + manage client 
  // SoA — one array per property → max performance + tiny RAM
  state : Uint8Array  = new Uint8Array(this.sizeplus);  // CellState
  owner : Uint8Array  = new Uint8Array(this.sizeplus);  // Owner
  /** 1..24 for case of 8 dragons on x 3 rows. for each player.
   * In case of empty cell(no item) use 0.
   * Let is say p1 owner of 1..24 dragons. The p2 is owner of 25..48 dragons.
   * They are just numbers in this array, with proper indices respectively.
   * F.e. in initial moment before gameplay starts the
   * p1 dragon 24 has index 24 in item array so. item[24] === 24.
   * then empty cells on game board, then dragons of p2 and last of them the
   * p2 dragon 48 has index 64 in item array so. item[64] === 48.
   * The game play changes the places(indices) where the dragons 1..48 placed.
   * Or disappears after RIP condition(become 0 insitead of 1..48).
   * F.e. item[64] === 0, cell just empty or after RIP.
   */
  item : Uint8Array = new Uint8Array(this.sizeplus); // unique ID per piece
  /** the value of dragon type one of three (origianlly 1 2 3) .
   * Advanced planned as 4. */
  type : Uint8Array  = new Uint8Array(this.sizeplus);  // DragonType
  
  // todo here need implementation with proper proportional damaging. Still not balanced
  /** health power, while > 0 , item still alive */
  hp : Uint8Array  = new Uint8Array(this.sizeplus);  // depends on type of item or 0
  /** magic power, used for attack, requires recovering time after step */
  mp : Uint8Array  = new Uint8Array(this.sizeplus);  // depends on type of item or 0
  /** step max range - f.e. value 2 means 1 (2 3), used for step/attack distance limit */
  jump : Uint8Array  = new Uint8Array(this.sizeplus);  // depends on type of item or 0

  cell_selected_by_role = new Uint8Array(4) // 0 - not used, role 1, role 2, bot (3)
  
  /** DO NOT USE AS POSSIBLE. To monitor full cell state. Internally checks DEVLOG first */
  logcell(idx:number){
    if (!DEVLOG) return
    devlog(
    "idx:"+idx,
    "state:"+this.state[idx],
    "owner:"+this.owner[idx],
    "item:"+this.item[idx],
    "type:"+this.type[idx],
    "hp:"+this.hp[idx],
    "mp:"+this.mp[idx],
    "jump:"+this.jump[idx]
    )
  }

  /** set cell to TMDC_CellState.EMPTY condition */
  reset_cell(idx:number){
    this.state[idx] = TMDC_CellState.EMPTY
    this.owner[idx] = TMDC_Owner.NONE
    this.item[idx] = 0
    this.type[idx] = TMDC_DragonType.NONE
    this.hp[idx] = 0
    this.mp[idx] = 0
    this.jump[idx] = 0
  }

  /** write data to cell with idx */
  write_cell(cell:TMDC_CellBackup){
    const c = cell
    const idx = c.idx
    this.state[idx] = c.state
    this.owner[idx] = c.owner
    this.item[idx] = c.item
    this.type[idx] = c.type
    this.hp[idx] = c.hp
    this.mp[idx] = c.mp
    this.jump[idx] = c.jump
  }

  /** read the cell into backup type */
  read_cell(idx:number):TMDC_CellBackup{
    const i = idx
    return {
      idx:i, 
      state:this.state[i]!,
      owner:this.owner[i]!,
      item:this.item[i]!,
      type:this.type[i]!,
      hp:this.hp[i]!,
      mp:this.mp[i]!,
      jump:this.jump[i]!,
    }
  }

  backup_cell( idx:number, backup:TMDC_CellBackup[]){
    backup.push(this.read_cell(idx))
  }
  /** to lock the cell as possible faster,
   * the state must be set in advance before backup.
   * For this case the "st[c].state" manually set to TMDC_CellBackup.DESTINATION.
   * To prevent conflicting.
   * 
   * After that the backup will record wrong value of state, so this method
   * will backup the mutated state which was EMPTY before.
   * And force the backuped cell state to EMPTY
   */
  backup_cell_as_empty( idx:number, backup:TMDC_CellBackup[]){
    const c = this.read_cell(idx)
    c.state = TMDC_CellState.EMPTY
    backup.push(c)
  }

  /** recovers all cells from backup. Then clean backup.
   * */
  recover_cells(backup:TMDC_CellBackup[]){
    const blen = backup.length
    for (let i=0;i<blen;i++){
      const b = backup[i]!//warning unsafe speed
      const idx = b.idx
      this.state[idx] = b.state
      this.owner[idx] = b.owner
      this.item[idx] = b.item
      this.type[idx] = b.type
      this.hp[idx] = b.hp
      this.mp[idx] = b.mp
      this.jump[idx] = b.jump
    }
    backup.length = 0
  }

  /** properly select cell, with update cell_selected_by_role */
  select_cell_with_role(c:number, role:number){
    this.cell_selected_by_role[role] = c
    this.state[c] = TMDC_CellState.SELECTED
    this.owner[c] = role
  }

  /** attempt to select the cell.
   * 
   * @param c - the cell index in array. On server side the zero index is empty, so cells started from index 1
   * 
   * @returns
   * - [c] in case of cell selection command. The response is one cell index.
   * 
   * - [-c, ms] in case of step on board command. The response is
   * negative cell index(sign of step but not selection)
   * and the step duration in ms.
   * 
   * ms - the time of the full step from original cell up to destination cell.
   * The "ms" calculated depends on step length (number of affected cells) etc.
   *  */
  click_cell(c:number, role:number):[TMDC_BOARD_MESSAGE[],TMDC_BOARD_ACTION[]]{
    this.logcell(c)
    
    const st = this.state
    const ow = this.owner
    
    /** messages and actions -> cmd for upper level. */
    const result:[TMDC_BOARD_MESSAGE[], TMDC_BOARD_ACTION[]] = [[],[]]
    if(DEVLOG) devlog("st[c]: "+st[c]+" TMDC_CellState.OCCUPIED: "+TMDC_CellState.OCCUPIED)//todo remove

    switch(st[c]){
      case TMDC_CellState.EMPTY:
        //lock as possible faster to prevent conflicting.
        st[c] = TMDC_CellState.DESTINATION;
        /** backup cells affected by potential step in order [destination, attacked, origin] */
        const backup:TMDC_CellBackup[] = []
        try {
          /* check the selection is present */
          const sidx = this.cell_selected_by_role[role]
          if (!sidx){
            devlog("click on EMPTY without selected before")
            break
          }

          const st_sidx = st[sidx]
          if (st_sidx === TMDC_CellState.RIP){
            st[c] = TMDC_CellState.EMPTY;
            break // case of click to EMPTY cell after selected item RIP, and can not move
          }
          //theoretically it can be managed different way. in time of rip_cell() iterate through this.cell_selected_by_role for 1(player1) 2(player2) 3(not implemented bot). and if some cell index found. then set it to 0. Then previous check if (!sidx) will fire when EMPTY cell clicked for step
          
          if (st_sidx === TMDC_CellState.RECOVERING){
            st[c] = TMDC_CellState.EMPTY;
            break
          }//rollback manually the clicked cell and waiting for recovering over
          
          this.backup_cell_as_empty(c, backup)
  
          /** from destination to origin [i1, i2...]  */
          const idxs = this.step_indices(c, sidx)
          if(!idxs.length){ // rollback manually
            st[c] = TMDC_CellState.EMPTY
            break
          }
          
          if(DEVLOG) devlog("step idxs from destination to origin", idxs.toString())
          
          // change all intermediate cells of step to DESTINATION, to block selection in time of step
          for (let i=1;i < idxs.length-1;i++){
            const idx = idxs[i]!
            this.backup_cell(idx, backup)
            if(st[idx] !== TMDC_CellState.RIP) st[idx] = TMDC_CellState.DESTINATION
          }

          // change st[oldidx] to EMPTY , say item/dragon flew away(will).
          /** selected index, or old index. original position for step */
          this.backup_cell(sidx, backup)
          
          if(DEVLOG) devlog("print last backup.at(-1)",mm.logobj(backup.at(-1)!))//warning //todo remove it is huge load

          // based on duration of the animation of the attack and cell position, for each entermediate cell separately, book some delayed check of these cells when they will be attacked by step.

          //todo implement properly, it is raw gap
          /** attacked cells number */
          const acn = idxs.length-2

          /** this is milleseconds of one stage of animation of the step */
          const stage_ms = 200 //warning forces clients animate follow this base value
          /** common duration of the step cycle, for all item types
           * f.e. [1,9,17], three cells.
           * Four stages of animation. Flyup from 17. Fly 17-9. Fly 9-1. Flydown to 1.
           * The same time for each step, f.e. 1000 ms
           */
          const duration = stage_ms*(idxs.length+1) * 2
          const scell = { ... backup.at(-1)!} // selected/origin cell
          
          result[1].push({
            atype:GameRoomDelayedAction.MOVE_ITEM_TO_CELL,
            data:{c, cell:scell, recovering:duration/(scell.jump-acn), role},
            ms:duration
          })

          for (let i=1;i<=acn;i++){
            const dmg = this.mp[sidx]!/acn
            const ms = duration-stage_ms*(i+1) //warning raw
            
            result[1].push({
              atype:GameRoomDelayedAction.ATTACK_CELL,
              data:{idx:idxs[i]!, dmg},
              ms
            })
          }

          this.reset_cell(sidx) //now origin cell is EMPTY
          this.select_cell_with_role(c, role)          

          // todo consider When delayed attack to cell happens, the check of damaging happens for the items that placed above the cell(not implemented at all). Client responsible to animate during the step a damage of the each cell(fire , lightning, volcano etc) + animate dragons under damage or die animation if no hp animore.

          // todo consider remove/hide plate when RIP happens on client side, but show some visuals,depends on type of item dead
          
          result[0].push({c:c, o:sidx, ms:duration, to_role:role}) // step {to , from, during}
          result[0].push({c:-sidx, to_role:role}) // unselect
          return result
        } catch (error) {
          errlog("board.ts click_cell idxs stuff catch:error", error)
          /** backup cells state, anyways backup must be not longer then idxs */
          // warning danger
          this.recover_cells(backup)
          //todo remove this.clear_timers(timers); // cancel to prevent damage without step
          devlog("cells state backup done")
        }
        break
      case TMDC_CellState.OCCUPIED:
        // devlog("occupied by", ow[idx], "role", role, "c", c, "idx", idx)//todo remove
        if(ow[c] === role){
          /** manage selected before */
          let old = this.cell_selected_by_role[role]
          devlog("old selected index: "+old) //todo remove
          if(old){ // unselect old selected
            if (st[old] !== TMDC_CellState.RIP) st[old] = TMDC_CellState.OCCUPIED
            result[0].push({c:-old!,to_role:role})
          }
          
          /** select new one by idx */
          st[c] = TMDC_CellState.SELECTED
          this.cell_selected_by_role[role] = c
          result[0].push({c,to_role:role})
          return result
        }
        devlog("attempt to (interact with)select not owned item")
        break
      default:
        errlog("implement other cell state cases")
    }
    return [[],[]]

  }

  constructor() {
    this.reset();
  }

  // todo Reset to initial game state (custom rules to place items on board)
  reset(): void {
    //precaching references
    const state_ = this.state
    const owner_ = this.owner
    const item_ = this.item
    const type_ = this.type
    const hp_ = this.hp
    const mp_ = this.mp
    const jump_ = this.jump
    const cell_selected_by_role_ = this.cell_selected_by_role

    state_.fill(TMDC_CellState.EMPTY);
    owner_.fill(TMDC_Owner.NONE);
    item_.fill(0);
    type_.fill(0);
    hp_.fill(0);
    mp_.fill(0);
    jump_.fill(0);
    cell_selected_by_role_.fill(0)

    // todo: place starting dragons here
    // todo Example: Player1 bottom rows, Player2 top rows. On client side for 2d can be tricky, for 3d just rotate camera. So consider dev demo carefully if it will be 2d.
    /* fill indices for original positions of all the dragons for both players*/
    const p1d3from = 1
    const p1d3to = 9 // x8 thunder dragons for player1 (long range arjergard)
    const p1d2from = 9
    const p1d2to = 17 // x8 fire dragons for player1
    const p1d1from = 17
    const p1d1to = 25 // x8 earth dragons for player1 (armored avangard)
    
    const p2d1from = 41
    const p2d1to = 49 // x8 earth dragons for player2
    const p2d2from = 49
    const p2d2to = 57 // x8 fire dragons for player2
    const p2d3from = 57
    const p2d3to = 65 // x8 thunder dragons for player2
    /* ugly part to loop little bit faster in init process */
    /** manage empty cells on board vs item numbers, when fill the board initially */
    const p2loop_delta = p1d1to - p2d1from
    
    state_.fill(TMDC_CellState.OCCUPIED,p1d3from,p1d1to);
    state_.fill(TMDC_CellState.OCCUPIED,p2d1from,p2d3to);
    
    owner_.fill(TMDC_Owner.P1,p1d3from,p1d1to); //todo bot will need injection
    owner_.fill(TMDC_Owner.P2,p2d1from,p2d3to);
    
    // item_.set(new Uint8Array(Array.from({length:24}, (_,i)=>i+1)), p1d3from);
    // item_.set(new Uint8Array(Array.from({length:24}, (_,i)=>i+25)), p2d1from);
    // tiny bit more performant version
    for (let i = p1d3from; i < p1d1to; i++) item_[i] = i
    for (let i = p2d1from; i < p2d3to; i++) item_[i] = i + p2loop_delta
    // devlog("item_", item_)//todo remove    

    type_.fill(TMDC_DragonType.THUNDER,p1d3from,p1d3to);
    type_.fill(TMDC_DragonType.FIRE,p1d2from,p1d2to);
    type_.fill(TMDC_DragonType.EARTH,p1d1from,p1d1to);

    type_.fill(TMDC_DragonType.EARTH,p2d1from,p2d1to);
    type_.fill(TMDC_DragonType.FIRE,p2d2from,p2d2to);
    type_.fill(TMDC_DragonType.THUNDER,p2d3from,p2d3to);
    
    mp_.fill(TMDC_DragonMP.THUNDER,p1d3from,p1d3to);
    mp_.fill(TMDC_DragonMP.FIRE,p1d2from,p1d2to);
    mp_.fill(TMDC_DragonMP.EARTH,p1d1from,p1d1to);

    mp_.fill(TMDC_DragonMP.EARTH,p2d1from,p2d1to);
    mp_.fill(TMDC_DragonMP.FIRE,p2d2from,p2d2to);
    mp_.fill(TMDC_DragonMP.THUNDER,p2d3from,p2d3to);

    hp_.fill(TMDC_DragonHP.THUNDER,p1d3from,p1d3to);
    hp_.fill(TMDC_DragonHP.FIRE,p1d2from,p1d2to);
    hp_.fill(TMDC_DragonHP.EARTH,p1d1from,p1d1to);

    hp_.fill(TMDC_DragonHP.EARTH,p2d1from,p2d1to);
    hp_.fill(TMDC_DragonHP.FIRE,p2d2from,p2d2to);
    hp_.fill(TMDC_DragonHP.THUNDER,p2d3from,p2d3to);
    
    jump_.fill(TMDC_DragonRange.THUNDER,p1d3from,p1d3to);
    jump_.fill(TMDC_DragonRange.FIRE,p1d2from,p1d2to);
    jump_.fill(TMDC_DragonRange.EARTH,p1d1from,p1d1to);

    jump_.fill(TMDC_DragonRange.EARTH,p2d1from,p2d1to);
    jump_.fill(TMDC_DragonRange.FIRE,p2d2from,p2d2to);
    jump_.fill(TMDC_DragonRange.THUNDER,p2d3from,p2d3to);
  }

  // Helpers - index <=> x,y
  idx(x: number, y: number): number {
    return (y - 1) * this.width + x;
  }
  
  getX(idx: number): number { return (idx - 1) % this.width + 1; }
  getY(idx: number): number { return Math.floor((idx - 1) / this.width) + 1; }

  /** check the cell is on vertical or horozontal direction only, from selected.
   * check the cell close enough depends on item type(jump ability).
   * Then return indices
   * [destination(new clicked) [, step, attacked], origin(old selected)]
   * */
  step_indices(idx:number, sidx:number){
    const result = []
    
    /** check the cell is different from the selection.
     * None mandatory check since filtered above */
    if (sidx === idx){
      errlog("click on EMPTY which is SELECTED before", "should never fire")
      return []
    }
    /** check the cells placed non-diagonally */
    const dest_col = this.getX(idx)
    const dest_row = this.getY(idx)
    const orig_col = this.getX(sidx)
    const orig_row = this.getY(sidx)
    const d_col = dest_col - orig_col
    const d_row = dest_row - orig_row
    
    if (d_col !== 0 && d_row !== 0){
      if (DEVLOG){
        devlog("not a horizontal/vertical click", "consider ban if filtred by client")
        rawlog("d_col=", d_col, " d_row=", d_row, " idx=", idx, " sidx=", sidx)
        rawlog("func test:idx(getX(),getY()) === idx: ", idx, "===", this.idx(this.getX(idx),this.getY(idx)) )
        rawlog("func test:sidx(getX(),getY()) === sidx: ", sidx, "===", this.idx(this.getX(sidx),this.getY(sidx)) )
        rawlog("dest_col=",dest_col, " orig_col=",orig_col, " dest_row=",dest_row, " orig_row=",orig_row)
      }
      return []
    }
    
    /** check the destination cell is close enough to selected cell.
     * Depends on item type(dragon type/jump ability)
     * */

    /** distance of the click*/
    const d = Math.abs(d_col?d_col:d_row?d_row:0)
    if (!d) {
      errlog("distance between selected and clicked is ", d, "should never fire")
      return []
    }
    
    /** range dragon can jump through/over*/
    const r = this.jump[sidx]
    if(!r){
      devlog("this.jump[sidx] fails to give range", "sidx=", sidx, "r=", r,"should not happen")
      return []
    }

    if(d>r){
      devlog("item CAN NOT jump so far: d > r", "d=", d, "r=", r, "consider ban if client filtered")
      return []
    } // todo consider ban if client filtered

    const horizontal = d_row === 0;
    const steps = horizontal ? Math.abs(d_col) : Math.abs(d_row);  // exact number of cells - 1

    // Direction toward origin. Again , at the moment we start from destination cell.
    const dirX = orig_col < dest_col ? -1 : (orig_col > dest_col ? +1 : 0);
    const dirY = orig_row < dest_row ? -1 : (orig_row > dest_row ? +1 : 0);

    let x = dest_col;
    let y = dest_row;

    // todo Always manages destination first-> potentially attacked -> origin last. But in same time the appearing on the client side should be natural from origin to destination. For this the ws messages should be implemented with delay. First one has longest delay. Last one origin cell has no delay or minimal delay(50ms). So finally on client side the sequence of arrived messages will be natural from origin to destination(for animation of the fire etc, when dragon throws the flame or flashes). I feel it like this at the moment. But here is just indices
    for (let i = 0; i <= steps; i++) {
      result.push(this.idx(x,y))
      if (i < steps) {
        x += dirX;
        y += dirY;
      }
    }

    return result
  }
  
  /** manage move item/dragon from selected cell to destination cell after step
   * @param c destination cell index
   * @param cell selected cell data as object (origin before step started)
   * @param recovering [ms] after step complete
   * @param role value to set new cell owner
   */
  move_dragon_to_cell(c:number, cell:TMDC_CellBackup, recovering:number, role:number)
  :TMDC_BOARD_ACTION{
    cell.idx = c
    cell.state = TMDC_CellState.RECOVERING
    this.write_cell(cell)
    this._step_happen = true
    return {
      atype: GameRoomDelayedAction.SELECT_CELL_AFTER_RECOVERING,
      data: { c, role },
      ms: recovering
    }
  }

  /** if selection was not changed in time of recovering,
   * switch from RECOVERING to OCCUPIED if item still alive
   * @param c destination cell index
   * @param role value to set new cell owner
   */
  select_cell_after_recovering(c:number, role:number):boolean{
    if (this.owner[c] === role){
      const sidx = this.cell_selected_by_role[role]
      if (sidx === c){
        this.state[c] = TMDC_CellState.SELECTED // selection was not moved
        devlog("old selection preserved. sidx: "+sidx+ " role: "+role)
        return true
      } else {
        this.state[c] = TMDC_CellState.OCCUPIED
        devlog("can select again. sidx: "+sidx+ " role: "+role)
      }
    }
    return false
  }

  /** check the cell has item. damage item's hp, modify cell state accordingly
   * @returns idx of rip cell or 0 of cell item still alive
   */
  attack_cell(idx:number, dmg:number)
  :number{
    if (this.item[idx]){// there is item/dragon on index, and hp!==0
      const hp_ = this.hp
      if (hp_[idx] && hp_[idx] > dmg){ //todo need refactor hp and damage balances , to always integer
        hp_[idx] -= dmg
        this.state[idx] = TMDC_CellState.OCCUPIED // item still alive on cell
      }else{//kill the item and destroy the cell. On upper lever the RIP message will be sent to client using returned idx
        this.rip_cell(idx)
        return idx
      }
      this._damage_happen = true
      if(DEVLOG) rawlog("attack_cell attacked cell idx:", idx, " st[idx]:", this.state[idx]) //todo remove
    }else if(this.state[idx] !== TMDC_CellState.RIP){
      if(DEVLOG) rawlog("attack_cell non-RIP cell idx:", idx, " st[idx]:", this.state[idx]) //todo remove
      this.reset_cell(idx) //except RIP
    }
    if(DEVLOG) rawlog("check_attacked_cell_to_damage:", "idx=", idx, " hp=", this.hp[idx], " dmg=", dmg)//todo remove
    return 0 // no RIP message sent, since item still alive or cell not occupied at the attack moment
  }

  /** destroy the cell and item, then inform client */
  rip_cell(c:number){
    this.state[c] = TMDC_CellState.RIP //warning not fully cleaned
    this.item[c] = 0
    this.hp[c] = 0
    rawlog("RIP_CELL executed") //todo remove
    this.logcell(c) //todo remove
  }

  /** to reject repeated scheduling of exit game , when all players exit */
  has_scheduled_exit = false
  player_exit_game(role: number, connected_players_number:number): [TMDC_BOARD_MESSAGE[], TMDC_BOARD_ACTION[]]{
    const result:[TMDC_BOARD_MESSAGE[], TMDC_BOARD_ACTION[]] = [[],[]]

    let wrole = role > 1?1:2 // winner role
    result[0].push({c:0,o:1,ms:3000,to_role:wrole})
    result[0].push({c:0,o:-1,ms:3000,to_role:role})
    // todo the "o"(good, nice, best or so, for each receiver independently) can be calculated depends on current condition/results, how many items still alive from both sides or so.
    result[1].push({
      atype:GameRoomDelayedAction.EXIT_GAME,data:{role},
      ms:Math.log(connected_players_number + 1) * 1000 + 2000
    })

    return result
  }

  /** returns only message data, without delayed actions, to not bind to specific actions of one game */
  ws_close_exit_game():TMDC_BOARD_MESSAGE[]{
    const result:TMDC_BOARD_MESSAGE[] = []
    //todo fix later
    let wrole = 3 // winner role. artefact
    result.push({c:0,o:1,ms:3000,to_role:wrole})
    // todo the "o"(good, nice, best or so, for each receiver independently) can be calculated depends on current condition/results, how many items still alive from both sides or so.
    if(DEVLOG) rawlog("ws_close_exit_game() message:", mm.logobj(result))
    return result
  }

  /** returns only message data, without delayed actions, to not bind to specific actions of one game */
  no_activity_exit_game(connected_players_number:number, victory_role:number): [TMDC_BOARD_MESSAGE[], TMDC_BOARD_ACTION[]]{
    const result:[TMDC_BOARD_MESSAGE[], TMDC_BOARD_ACTION[]] = [[],[]]
    switch(victory_role){
      case 1:{
        result[0].push({c:0,o:1,ms:3000,to_role:1})
        result[0].push({c:0,o:-1,ms:3000,to_role:2})
        break
      }
      case 2:{
        result[0].push({c:0,o:-1,ms:3000,to_role:1})
        result[0].push({c:0,o:1,ms:3000,to_role:2})
        break
      }
      default:{
        result[0].push({c:0,o:0,ms:3000,to_role:0}) //no winner:o:0, to both roles:0
        break
      }
    }
    // todo the "o"(good, nice, best, no-activity or so, for each receiver independently) can be calculated depends on current condition/results, how many items still alive from both sides or so.
    result[1].push({
      atype:GameRoomDelayedAction.EXIT_GAME,data:{},
      ms:Math.log(connected_players_number + 1) * 1000 + 2000
    })
    if(DEVLOG) rawlog("no_activity_exit_message ", mm.logobj(result))
    return result
  }
}
