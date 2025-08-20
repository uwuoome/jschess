import { getAiMove } from "@/lib/chess-ai";

let controller: AbortController | null = null; 

self.onmessage = async (e: MessageEvent) => {
  if(e.data.stop){
    controller?.abort();
    controller = null;
    return;
  }else if(controller != null){
    console.log("Cannot initiate a new move search: AI is already in thought.");
    return;
  }
  const board: string[] = e.data.board;
  const depth: number = e.data.depth || 4;
  controller = new AbortController();
  try{
    const move = await getAiMove(board, depth, 800, controller.signal);
    if(!controller.signal.aborted){
      self.postMessage({ move });
    }
  }catch(err){
    console.log("AI move aborted.");
  }finally{
    controller = null;
  }
};