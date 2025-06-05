# Multiplayer Pong

A simple two-player Pong clone using Node.js, Socket.IO, and React.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [pnpm](https://pnpm.io/)

## Installation

From the repository root, install workspace dependencies:

```bash
pnpm install
```

## Running the game locally

Start the Socket.IO server and the React development server in separate terminals:

```bash
pnpm dev:server    # runs the server on http://localhost:4000
pnpm dev:client    # runs the client on http://localhost:5173
```

## Playing

1. Open `http://localhost:5173` in **two** browser windows or tabs.
2. The first window will display `Waiting for opponent…` until the second window connects.
3. Once paired, both clients show `Game starting — you're LEFT/RIGHT` and the current paddle positions.
4. Use the `ArrowUp` and `ArrowDown` keys to move your paddle. Movements are sent to the server and broadcast to keep both players in sync.

To play with someone on another machine, the Socket.IO server listens on port **4000** and the client on **5173**. These ports must be reachable by your opponent. If you're behind NAT or have strict firewall rules, you may need to forward the ports or open them so the connection can be established.

## Testing & Type Checking

Run the full test suite and TypeScript checks:

```bash
pnpm exec vitest run
pnpm exec tsc -p server
pnpm exec tsc -p client
```

