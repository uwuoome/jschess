import { getAiMove } from "@/lib/chess-ai";
// @ts-ignore
import initModule from '../lib/wasm-ai.js';

let controller: AbortController | null = null; 


export type WasmModule = {
	abMinMax: (isBlack: boolean, board: any, depth: number, callback: (i: number, n: number)=>void) => string;
	Board: any; 
};

let wasmStarted = false;
let wasm: WasmModule | null = null;


async function getWasmAiMove(board: string[], searchDepth: number=4, minDelay: number=800, signal: AbortSignal){
	if(! wasm) return null;

	const cppBoard = new wasm.Board();
	for (let i = 0; i < board.length; i++) {
		cppBoard.push_back(board[i].charCodeAt(0)); 
	}

	const delay = new Promise<void>(resolve => setTimeout(resolve, minDelay));
	let aiMove = null;
	function pieceEvaluatedCallback(i:number, n: number){
		self.postMessage({progress: 100 / n * (i+1)});
		return signal.aborted || false;
	}
	const aiPromise = new Promise<void>((resolve) => {
		setTimeout(() => {
			aiMove = wasm?.abMinMax(true, cppBoard, searchDepth, pieceEvaluatedCallback);
			resolve();
		}, 0);
	});

	await Promise.all([aiPromise, delay]);
	cppBoard.delete();
	return aiMove;
}

async function loadWasm(_e: MessageEvent) {
	if (wasmStarted) return;
	wasmStarted = true;
	const mod = await initModule({
		locateFile: (path: string) => {
			if (path.endsWith('.wasm')) {
				return '/wasm.wasm';
			}
			return path;
		},
	});
	wasm = mod;
	self.postMessage({ wasm: true });
}

async function search(e: MessageEvent){
	if(controller != null){
		console.log("Cannot initiate a new move search: AI is already in thought.");
		return;
	}
	const board: string[] = e.data.board;
	const depth: number = e.data.depth || 4;

	controller = new AbortController();
	function pieceEvaluatedCallback(i:number, n: number){
		self.postMessage({progress: 100 / n * (i+1)});
	}

	let move = null;
	if(e.data.wasm && wasm != null){ // revert to javascript if Wasm hasnt been loaded yet for some reason
		move = await getWasmAiMove(board, depth, 800, controller.signal);
	}else{
		move = await getAiMove(board, depth, 800, controller.signal, pieceEvaluatedCallback);
	}
	if(controller?.signal && (!controller.signal.aborted)){
		self.postMessage({ move });
	}
	controller = null;
}

async function stop(_e: MessageEvent){
	controller?.abort();
	controller = null;
}



self.onmessage = async (e: MessageEvent) => {
	switch(e.data.action){
		case "stop": return stop(e);
		case "search": return search(e);
		case "loadWasm": return loadWasm(e);
		default: self.postMessage({error: `Unknown action ${e.data.action}`});
	}
}

