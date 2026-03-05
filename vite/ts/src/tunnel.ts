/* for server codebase. To avoid serverside refactoring difficulties */

import { MT, KEYMAP, MT_NAME } from '../../../bun/src/enums/mt'
export { MT, KEYMAP, MT_NAME }

import { mm } from '../../../bun/src/manage/message'
export { mm }

import { spip } from '../../../bun/src/utils/safe'
export { spip }

import type { Ship, Frontmove, FrontRotation, TopRotation, SideRotation, LazerBeam } from '../../../bun/src/gameroom/sss/types'
export type { Ship, Frontmove, FrontRotation, TopRotation, SideRotation, LazerBeam }

import { gemm } from '../../../bun/src/gameroom/sss/gameboard/non-autistic-math/gemm'
export { gemm }