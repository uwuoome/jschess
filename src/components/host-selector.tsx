import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
 
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import type { FriendData } from "@/store/settingsSlice"
 
type Props = {
    onJoin: (email: string) => void;
}

export default function HostSelector({onJoin}: Props) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")
    const friends = useSelector((state: RootState) => state.profile.list);
    function onHostSelected(currentValue: string) {
        const nextValue = currentValue === value ? "" : currentValue;
        setValue(nextValue);
        setOpen(false);
        if(nextValue){
          onJoin(nextValue);      
        }
    }
    if(friends.length == 0){
        return (
            <span className="m-2">Add a friend to your friends list to play against them.</span>
        );
    }
    return (
    <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
            {value
            ? value //friends.find((f: FriendData) => f.handle === value)?.handle
            : "Play Against..."}
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
        <Command>
            <CommandInput placeholder="Play Against..." />
            <CommandList>
            <CommandEmpty>No friends found. Add some to your friend list.</CommandEmpty>
            <CommandGroup>
                {friends.map((f: FriendData) => (
                <CommandItem key={f.handle} value={f.handle} onSelect={onHostSelected}>
                    <CheckIcon className={cn("mr-2 h-4 w-4", value === f.handle ? "opacity-100" : "opacity-0")} />
                    {f.handle} {f.name && `(${f.name})`}
                </CommandItem>
                ))}
            </CommandGroup>
            </CommandList>
        </Command>
        </PopoverContent>
    </Popover>
    );
}