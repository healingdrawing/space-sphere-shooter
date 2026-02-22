# online-ws-game
Multiplayer online browser game. TypeScript client. TypeScript server.  

## Development environment

- install [Bun](https://bun.sh) runtime.
- install [nvm](https://github.com/nvm-sh/nvm) (to manage node versions), or just install [node](https://nodejs.org/en).
- clone the repository using vscode.
- open terminal in **repo root level**(this README.md file folder).
- development and build command sequences started from the **repo root level**.

Project development runtime version `bun -v` upgraded to version **1.3.8**

## Development run

### Server
- terminal: `cd bun`
- terminal: `bun i`
- terminal: `bun run dev`

### Client
- terminal: `cd vite/ts`
- terminal: `bun i`
- terminal: `bun run dev`

**The vpn extension of the browser can raise CORS issues in case of local development.**

Yes, the client and the server are separated, and executed using the same command, but from different folders.

## Build

Standalone build and Dockerfile build available.

## Dockerfile build

[Docker](https://www.docker.com) environment must be installed, configured and run.

### Server

- terminal: `cd bun`
- terminal: `./run.sh`

### Client

- terminal: `./run.sh`

## Standalone build

### Server

- terminal: `cd bun`
- terminal: `bun i --no-cache`
- terminal: `bun build --env-file=./.env --minify ./src/index.ts --outdir ./out --target=bun --env=inline`
- **out** folder created.
- (optional) terminal: `bun run out/index.js` to check(run) the build.

### Client

- terminal: `cd vite/ts`
- terminal: `bun i`
- terminal: `bun run build`
- **dist** folder created.
- (optional) terminal: `bun add serve` to install local test server.
- (optional) terminal: `bun run serve -s dist` to check(run) the build.


## Structure

- separated client and server.
- development run from separated terminals.
- the same **.env** file used to configure both client and server.
- **.env** placed in "bun" folder of the repo.
- **.env** has no unsafe/secret info.

**SERVER**:
- [Bun.sh](https://bun.sh) runtime based server .
- - Dockerfile.
- - everywhere uses ws connection, except home page buttons (use https).
- - - **Download assets** - for future needs, to download heave assets before join.
- - - **Check Connection** - check the client not banned (at the moment no alert if server is dead, but naturally visible in console).
- - - **Connect to WebSocket** - establish ws connection to server.
- - **everything in ram**(no db used).
- - **autobalanced server load using .env file**. Maximum clients limited. When clients number changed, limits for chat changed(nickname length, message length, delays).
- - **nickname duplication** is possible.
- - **temporary ban** by ip (hardcoded for one hour), in case of signs of hijacking.
- - **(wip)**CORS managing from .env file, for multiple client domains.

**CLIENT**:
- [Vite](https://vite.dev) + [TypeScript](https://www.typescriptlang.org) client([Jotai](https://jotai.org) as ws state manager, [Babylon](https://www.babylonjs.com) for 3D).
- - Dockerfile.
- - **nickname can be changed** any time, according to current limits. Nickname must be shorten if limits were changed accordingly.
- - **chat messages always visible for all**. **(wip)**Chat styling and filtering.
- - chat history includes invitation icons **"VS" button**, to invite another user to 1 vs 1 match.
- - **chat.html** file button **Show game_view** for dev needs, will be removed later.
- - **minor error** - jump to chat
- - **critical error** - jump to home page, with closing connection
- - **(wip, minor)**compile to solid executable if possible using electrobun.dev or electron, to promote/distribute in Steam for free.


## Raw plan
<details>
<summary></summary>

Implement next:
- separated client and server.
- development run from separated terminals
- **.env** file used to configure both client and server
- **.env** placed in "bun" folder of the repo

**SERVER**:
- Bun server.
- - dockerized
- - everything using ws connection, except first call to server using get method to establish ws.
- - limited on the fly ws message using .env file, everything in ram(no db used).
- - (only plans)CORS managing from .env file, for multiple client domains.
- - nickname duplication is possible, use uuid on time of managing nickname.

**CLIENT**:
- vite + typescript client(jotai as state manager).
- - first screen just connect button.
- - manage nickname.
- - jump into chat view.
- - chat history includes invitation icons, to try to invite another user to 1 vs 1 match
- - after press invitation icon, the list of available to invite games/matches appears
- - jump to game view, if invite has accepted and both users are connected
- - jump back to chat view when match is over
- - minor error - jump to chat
- - critical error - jump to home page, with closing connection
- - able to be deployed as github page.
- - (minor)dockerized to deploy in cloud services.
- - (minor)compile to solid executable if possible using electrobun.dev or electron, to promote/distribute in Steam for free.

</details>