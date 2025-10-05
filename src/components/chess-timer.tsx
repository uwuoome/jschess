
import type { RootState } from '@/store';
import { outOfTime } from '@/store/chessSlice';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

type ChessTimerProps = {
    className?: string;
};


function formattedTime(time: number){
    const minutes =  Math.floor(time / 60);
    const seconds = time % 60;    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function ChessTimer({ className }: ChessTimerProps) {
    const activePlayer = useSelector((state: RootState) => state.chess.activePlayer);
    const players = useSelector((state: RootState) => state.chess.players);
    const dispatch = useDispatch();
    const [timerState, setTimerState] = useState("00:00");
    
    const timeLeftAtTurnStartRef = useRef<number>(0);
    const lastStartRef = useRef<number>(Date.now());
    const activePlayerTime = activePlayer != -1 ? players[activePlayer].time : players[0].time;
    const inactivePlayerTime = activePlayer != -1 ? players[activePlayer ^ 1].time : players[1].time;
    const inactiveFormattedTime = formattedTime(inactivePlayerTime);

    function tick(){
        const timeDelta = Date.now() - lastStartRef.current;
        const turnSecondsElapsed = Math.floor(timeDelta / 1000);
        const totalSecondsLeft = Math.max(timeLeftAtTurnStartRef.current - turnSecondsElapsed, 0); // don't show less than 0
        setTimerState(formattedTime(totalSecondsLeft));
        if(totalSecondsLeft <= 0){
            dispatch( outOfTime() );
        }
    }

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if(activePlayer == -1) return; // don't set an interval on game over
        interval = setInterval(tick, 1000);
        return () => {
            if(interval) clearInterval(interval);
        };
    }, [activePlayer]);

    useEffect(() => {       // on turn change
        if(activePlayer == -1) return;
        lastStartRef.current = Date.now();
        timeLeftAtTurnStartRef.current = activePlayerTime;
        tick();
    }, [activePlayerTime,  activePlayer]);

    return (
        <div className={className+" relative"}>
            <div className="inline-block pl-1 pr-1">
                {activePlayer < 1? timerState: inactiveFormattedTime}
            </div>
            <div className="inline-block bg-black text-white pl-1 pr-1 rounded-r-sm">
                {activePlayer > 0? timerState: inactiveFormattedTime}
            </div>
        </div>
    );
};

 export default ChessTimer;