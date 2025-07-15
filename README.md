# Peer to Peer WebRTC Client with Web Socket based Pairing server
A simple setup for creating peer to peer 2 player with React.

The client is built with Shadcn and Redux. If you want to use just the networking part the code is in the following files and modify for your needs:
```
components/p2p-game.jsx
hook/use-p2p.ts
```
The node server can be found in `services/pairing' 

Core communication relies on socket.io and simple-peer and works as follows:
 - The first client sends a web socket request to the pairing server for matchmaking, and is put on a waiting list.
 - The second client joining sends a web socket request, the server finds the waiting players socket and sends that to the joining player.
 - On receiving the waiting players socket ID, the joining player initiates a peer to peer connection with the waiting player via WebRTC.
 - Game related communication then takes place.
 - When the game ends or a player leaves, a termination signal is sent to their peer so their client can act appropriately.

