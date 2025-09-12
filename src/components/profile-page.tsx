import { useDispatch, useSelector } from "react-redux";
import Friends from "./friends";
import { store, type RootState } from "@/store";

/*import { useState } from "react";
import { CheckIcon } from "lucide-react"
 
import { aiPlayerTitle, cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
 */
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
 
import { setPieceStyle } from "@/store/settingsSlice";
import TextClickSelector from "./text-click-selector";
import AISelector from "./ai-selector";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";

function ProfilePage(){
    const myprofile = useSelector((state: RootState) => state.profile);
    const name = myprofile.myid || "Anonymous";
    const dispatch = useDispatch();
    // TODO: Elo, History
    function changePieceStyle(type: string){
        dispatch( setPieceStyle(type) );
    }
    const groupContainer = cn("p-2 mt-2 border-1 border-r-4", screen.width > 800? "mr-4": "");
    return (
    <>
        <h1>{name}</h1>
        <div className={groupContainer}>
            <h2>Preferences</h2>
            <span>Piece Style: </span>
            <ToggleGroup type="single" size="sm" variant="outline" value={store.getState().profile.pieceStyle} className="ml-2 inline" 
                    onValueChange={changePieceStyle}>
                <ToggleGroupItem value="mono" aria-label="Toggle Monochrome" >
                    Monochrome
                </ToggleGroupItem>
                <ToggleGroupItem value="duo" aria-label="Toggle Duotone">
                    Duotone
                </ToggleGroupItem>
            </ToggleGroup>
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
            {/*<code className="border-1 p-1 font-console bg-gray-200 text-black">{myprofile.mytoken}</code>*/}
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