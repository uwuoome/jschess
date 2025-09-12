import { useDispatch, useSelector } from "react-redux";
import Friends from "./friends";
import { store, type RootState } from "@/store";
import { useState } from "react";
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
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { setAiDifficulty, setPieceStyle } from "@/store/settingsSlice";
import TextClickSelector from "./text-click-selector";

function ProfilePage(){
    const myprofile = useSelector((state: RootState) => state.profile);
    const name = myprofile.myid || "Anonymous";
    const dispatch = useDispatch();
    // TODO: Elo, History
    const [open, setOpen] = useState(false)
    const onAiChanged = (currentValue: string) => {
        dispatch( setAiDifficulty(parseInt(currentValue)) );
        setOpen(false);
    }
    function changePieceStyle(type: string){
        dispatch( setPieceStyle(type) );
    }
    return (
    <>
        <h1>{name}</h1>
        <div className="p-2 mt-2 mr-4 border-1 border-r-4">
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
        <div className="p-2 mt-2 mr-4 border-1 border-r-4">
            <h2>AI Play</h2>
            <p>AI Difficulty Level: &nbsp; 
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
                    {aiPlayerTitle(myprofile.ailevel)}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandList>
                    <CommandGroup>
                        {[1, 2, 3].map((level: number) => (
                        <CommandItem key={level} value={level+""} onSelect={onAiChanged}>
                            <CheckIcon className={cn("mr-2 h-4 w-4", myprofile.ailevel === level ? "opacity-100" : "opacity-0")} />
                            {aiPlayerTitle(level)}
                        </CommandItem>
                        ))}
                    </CommandGroup>
                    </CommandList>
                </Command>
                </PopoverContent>
            </Popover>
            </p>
        </div>
        <div className="p-2 mt-2 mr-4 border-1 border-r-4">
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