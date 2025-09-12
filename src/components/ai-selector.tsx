import { aiPlayerTitle, cn } from "@/lib/utils";
import type { RootState } from "@/store";
import { setAiDifficulty } from "@/store/settingsSlice";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
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
import { CheckIcon } from "lucide-react";

type AISelectorProps = {
    prefix?: string;
    suffix?: string; 
    className?: string;
}

function AISelector(props: AISelectorProps){
    const ailevel = useSelector((state: RootState) => state.profile.ailevel);
    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();

    const onAiChanged = (currentValue: string) => {
        dispatch( setAiDifficulty(parseInt(currentValue)) );
        setOpen(false);
    }
    return (
    <span className={props?.className || ""}>    
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={open} className="w-[140px] justify-between">
                {props.prefix && props.prefix+" "}{aiPlayerTitle(ailevel)}{props.suffix && " "+props.suffix}
            </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
            <Command>
                <CommandList>
                <CommandGroup>
                    {[1, 2, 3].map((level: number) => (
                    <CommandItem key={level} value={level+""} onSelect={onAiChanged}>
                        <CheckIcon className={cn("mr-2 h-4 w-4", ailevel === level ? "opacity-100" : "opacity-0")} />
                        {props.prefix && props.prefix+" "}{aiPlayerTitle(level)}{props.suffix && " "+props.suffix}
                    </CommandItem>
                    ))}
                </CommandGroup>
                </CommandList>
            </Command>
            </PopoverContent>
        </Popover>
    </span>
    );
}

export default AISelector;