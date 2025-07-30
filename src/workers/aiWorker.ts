import { getNextMove } from "@/lib/chess-ai";

self.onmessage = (e: MessageEvent) => {
  const board: string[] = e.data.board;
  const depth: number = e.data.depth || 4;
  const move = getNextMove(true, board, depth);
  self.postMessage({ move });
};