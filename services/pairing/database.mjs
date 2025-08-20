import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';

dotenv.config({path: './variables.env'});

const db = new Database('pairing.db');
db.exec(
    `CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        hash TEXT NOT NULL,
        elo INTEGER NOT NULL DEFAULT 1500,
        created DATETIME DEFAULT CURRENT_TIMESTAMP
    ) `
);

const {lookup, players} = loadPlayers(); // holds all players in memory, when shoudl just load on demand
function loadPlayers(){
    const lookup = new Map();           // maps hashes to names
    const players = new Map();          // maps names to full data
    const stmt = db.prepare("SELECT * FROM players"); 
    for(const player of stmt.iterate()){
        players.set(player.name, player);
        lookup.set(player.hash, player.name);
    }
    return {lookup, players};
}

export function createPlayer(name){
    name = name.trim();
    if(players.has(name)){
        console.error("player with handle", name, "already exists"); 
        return null;
    }
    const validHandle = (handle) => /^[a-zA-Z0-9_]+$/.test(handle);
    if(! validHandle(name)){
        console.error("player attempting to create invalid handle:", name);        
        return null;
    }
    const created = (new Date()).toISOString();
    const hash = bcrypt.hashSync(name+created+process.env.USER_SALT, 10);
    const player = {name, elo: 1500, created, hash};
    const stmt = db.prepare("INSERT INTO players (name, hash, created) VALUES (?, ?, ?)");
    try{
        const info = stmt.run(name, hash, created);
    }catch(error){
        console.error(error);
        return null;
    }
    lookup.set(hash, name);
    players.set(name, player);
    return hash;
}

export function getPlayerByHash(hash){
    const name = lookup.get(hash);
    if(name == null) return null;
    return  players.get(name) || null;
}

export function getPlayerByName(name){
    return players.get(name);
}

export function numPlayerHandles(){
    return players.size;
}

export function listPlayerHandles(){
    return Array.from(players.keys()).sort();
}

export function resetDatabase(){
    const stmt = db.prepare("DELETE FROM players");
    try{
        const info = stmt.run();
    }catch(error){
        console.error(error);
        return null;
    }
    lookup.clear();
    players.clear();    
}


function calculateElo(playerRating, opponentRating, score, kFactor=32) {
  /*
  // Example usage:
  const myRating = 1600;
  const opponentRating = 1500;
  const result = 1; // You won
  const newRating = calculateElo(myRating, opponentRating, result);
  console.log("New rating:", newRating); //1607
  */
  const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  const newRating = playerRating + kFactor * (score - expectedScore);
  return Math.round(newRating);
}