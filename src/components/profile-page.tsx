import { useDispatch, useSelector } from "react-redux";
import Friends from "./friends";
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

const hilites = ["red", "amber", "lime", "cyan", "blue", "slate"];

function ProfilePage(){
    const myprofile = useSelector((state: RootState) => state.profile);
    const name = myprofile.myid || "Anonymous";
    const dispatch = useDispatch();
    // TODO: Elo, History
    function changeStyle(style: string, type: string){
        dispatch( setPreferredStyle({style, setting: type}) );
    }
    const groupContainer = cn("p-2 mt-2 border-1 border-r-4 max-w-140", screen.width > 800? "mr-4": "");
    const timerModes = [
        {name: "Standard", value: "standard", info: "90 minutes + 30 second increments."},
        {name: "Blitz", value: "blitz", info: "3 minutes + 5 second increments."},
        {name: "None", value: "none", info: "Take as much time as you like."}
    ];
    function changeTimer(mode: string){
        dispatch( setTimerMode(mode));
    }
    return (
    <>
        <div className={groupContainer}>
            <h2>Preferences</h2>
            <div className="mb-2">
                <span>Piece Style: </span>
                <ToggleGroup type="single" size="sm" variant="outline" value={myprofile.pieceStyle} 
                        className="ml-2 inline" onValueChange={changeStyle.bind(null, "piece")}>
                    <ToggleGroupItem value="mono" aria-label="Toggle Monochrome" >
                        Monochrome
                    </ToggleGroupItem>
                    <ToggleGroupItem value="duo" aria-label="Toggle Outlined">
                        Outlined
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>
            <div className="mb-2">
                <span>Board Style: </span>
                <ToggleGroup type="single" size="sm" variant="outline" value={myprofile.boardStyle}  className="ml-2 inline" 
                        onValueChange={changeStyle.bind(null, "board")}>
                    <ToggleGroupItem value="gray" aria-label="Toggle Gray Board" >
                        Gray
                    </ToggleGroupItem>
                    <ToggleGroupItem value="stone" aria-label="Toggle Stone Board">
                        Stone
                    </ToggleGroupItem>
                </ToggleGroup>  
            </div>
            <div>
                <span>Highlight: </span>
                <ToggleGroup type="single" size="sm" variant="outline" value={myprofile.hiliteStyle}  className="ml-2 inline" 
                    onValueChange={changeStyle.bind(null, "hilite")}>
                    {hilites.map(color => (
                        <ToggleGroupItem key={color} value={color} aria-label={`Toggle ${color} highlight`} >
                            <span className={`bg-${color}-400 w-4 h-4 rounded-sm`}></span>
                        </ToggleGroupItem>
                    ))}   
                </ToggleGroup>             
            </div>          
        </div>
        <div className={groupContainer+" hidden"}>
            <h2>Timer</h2>
            <ToggleGroup type="single" size="sm" variant="outline" className="ml-2 inline" value={myprofile.timerMode}
                onValueChange={changeTimer}>
                {timerModes.map((tm) => <ToggleGroupItem key={tm.value} value={tm.value}>{tm.name}</ToggleGroupItem>)}
            </ToggleGroup>
            <span className="ml-2">{timerModes.find(m => m.value == myprofile.timerMode)?.info || "N/A"}</span> 
        </div>
        <div className={groupContainer}>
            <Link to="/chess/ai"><Button className="float-right"><Play /></Button></Link>
            <h2>AI Play</h2>
            <p>AI Difficulty Level: &nbsp; <AISelector />
            </p>
        </div>
        <div className={groupContainer}>
            <Link to="/chess/p2p"><Button className="float-right"><Play /></Button></Link>
            <h2>Network Play</h2>
            {myprofile.mytoken? <>
                <p>Handle: <b>{name}</b></p>
                <p>Token: <TextClickSelector text={myprofile.mytoken} type="code" /></p>
            </>:
                <p>You do not have a handle or token required for network play set up yet.</p>
            }
            <Friends />
        </div>
    </>
    );
}

export default ProfilePage;