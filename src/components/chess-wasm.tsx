import type { ChessProps } from "./chess";
import Chess from "./chess";
import { AiWorker } from "@/components/chess";
import { useEffect, useState } from "react";



function ChessWasm(props: ChessProps){
	const [isReady, setIsReady] = useState<Boolean>(false);
  
	useEffect(() => {
		AiWorker.postMessage({action: "loadWasm"});
		AiWorker.onmessage = (e) => {
			if(e.data.wasm == null) return;
        	console.log(e.data.message);
			setIsReady(true);
        };
		return () => {}
	}, []);

	if(! isReady){
		return <h1 className=" text-blue-200">Loading Web Assembly...</h1>
	}else{
		return <Chess {...props} aiWasm={true} /> 
	}
}

export default ChessWasm;