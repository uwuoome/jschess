import { useDispatch, useSelector } from "react-redux";
import Friends from "./friends";
import type { RootState } from "@/store";
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
import { setAiDifficulty } from "@/store/settingsSlice";

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
    return (
    <>
        <h1>{name}</h1>
        {myprofile.mytoken? 
            <p>Your token: <code>{myprofile.mytoken}</code></p>
        :   <p>You do not have a token set.</p>}
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
                    {[1, 2, 3, 4, 5].map((level: number) => (
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
        <Friends />
    </>
    );
}

export default ProfilePage;