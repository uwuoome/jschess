import { useDispatch, useSelector } from "react-redux";
import { type RootState } from "@/store";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
 
import { setPreferredStyle, setTimerMode } from "@/store/settingsSlice";
import TextClickSelector from "./text-click-selector";
import AISelector from "./ai-selector";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";

const hilites = ["red", "yellow", "lime", "cyan", "blue", "slate"];

function ProfilePage(){
    const myprofile = useSelector((state: RootState) => state.profile);
    const name = myprofile.myid || "Anonymous";
    const dispatch = useDispatch();
    // TODO: Elo, History
    function changeStyle(style: string, type: string){
        if(style == null) return;  // prevent deselection
        dispatch( setPreferredStyle({style, setting: type}) );
    }
    const groupContainer = cn("p-2 mt-2 max-w-140", screen.width > 800? "mr-4": "");
    const timerModes = [
        {name: "Standard", value: "standard", info: "90 minutes + 30 second increments."},
        {name: "Blitz", value: "blitz", info: "3 minutes + 5 second increments."},
        {name: "Bullet", value: "bullet", info: "30 seconds + 3 second increments."},
        {name: "None", value: "none", info: "Take as much time as you like."}
    ];
    function changeTimer(mode: string){
        dispatch( setTimerMode(mode));
    }
    return (
    <>
        <div className={groupContainer}>
            <h2 className="text-blue-200">Preferences</h2>
            <div className="mb-2">
                <span  className="text-blue-200">Piece Style: </span>
                <ToggleGroup type="single" size="sm" variant="outline" value={myprofile.pieceStyle}
                        className="ml-2 inline" onValueChange={changeStyle.bind(null, "piece")}>
                    <ToggleGroupItem value="mono" aria-label="Toggle Monochrome"  className="bg-gray-500">
                        Monochrome
                    </ToggleGroupItem>
                    <ToggleGroupItem value="duo" aria-label="Toggle Outlined" className="bg-gray-500">
                        Outlined
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>
            <div className="mb-2">
                <span className="text-blue-200">Board Style: </span>
                <ToggleGroup type="single" size="sm" variant="outline" value={myprofile.boardStyle}  className="ml-2 inline" 
                        onValueChange={changeStyle.bind(null, "board")}>
                    <ToggleGroupItem value="gray" aria-label="Toggle Gray Board"  className="bg-gray-500">
                        Gray
                    </ToggleGroupItem>
                    <ToggleGroupItem value="stone" aria-label="Toggle Stone Board"  className="bg-gray-500">
                        Stone
                    </ToggleGroupItem>
                </ToggleGroup>  
            </div>
            <div>
                <span className="text-blue-200">Highlight: </span>
                <ToggleGroup type="single" size="sm" variant="outline" value={myprofile.hiliteStyle}  className="ml-2 inline" 
                    onValueChange={changeStyle.bind(null, "hilite")}>
                    {hilites.map(color => (
                        <ToggleGroupItem key={color} value={color} aria-label={`Toggle ${color} highlight`} className="bg-gray-500">
                            <span className={`bg-${color}-400 w-4 h-4 rounded-sm`}></span>
                        </ToggleGroupItem>
                    ))}   
                </ToggleGroup>             
            </div>          
        </div>
        <div className={groupContainer}>
            <h2 className="text-blue-200">Preferred Timer</h2>
            <p className="text-blue-200">The timer to use when initiating a chess game. When joining another player the 
                game timer is set to what the initiator has selected.
            </p>
            <ToggleGroup type="single" size="sm" variant="outline" className="ml-2 inline" value={myprofile.timerMode}
                onValueChange={changeTimer}>
                {timerModes.map((tm) => <ToggleGroupItem key={tm.value} value={tm.value} className="bg-gray-500">{tm.name}</ToggleGroupItem>)}
            </ToggleGroup>
            <span className="ml-2 text-blue-200">{timerModes.find(m => m.value == myprofile.timerMode)?.info || "N/A"}</span> 
        </div>
        <div className={groupContainer}>
            <Link to="/chess/ai"><Button className="float-right"><Play /></Button></Link>
            <h2 className="text-blue-200">AI Play</h2>
            <p><span className="text-blue-200">AI Difficulty Level: &nbsp; </span><AISelector />
            </p>
        </div>
        <div className={groupContainer}>
            <Link to="/chess/p2p"><Button className="float-right"><Play /></Button></Link>
            <h2 className="text-blue-200">Network Play</h2>
            {myprofile.mytoken? <>
                <p className="text-blue-200">Your handle: <b>{name}</b></p>
                <p>
                    <span className="text-blue-200">Token: </span>
                    <TextClickSelector text={myprofile.mytoken} type="code" />
                </p>
                <p className="text-blue-200">Last opponent: <b>{myprofile.lastOpponent || "N/A"}</b></p>
            </>:
                <p className="text-blue-200">You do not have a handle or token required for network play set up yet.</p>
            }
            {/*<Friends />*/}
        </div>
    </>
    );
}

export default ProfilePage;