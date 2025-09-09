
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { addFriend, removeFriend, type FriendData } from "@/store/settingsSlice";
import type { RootState } from "@/store";


import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { validHandle } from "@/lib/utils";

function FriendAdder(){
    const friends = useSelector((state: RootState) => state.profile.list);
    const [name, setName] = useState("");
    const [handle, setHandle] = useState("");
    const dispatch = useDispatch();

    function handleAdd(){
        console.log("ADD FRIEND", name, handle);
        if(! validHandle(handle)){                              // todo: notify
            return alert("invalid handle");    
        }
        if(friends.find((f: FriendData) => f.handle == handle) != null){
            // TODO: make existing row flash
            return; 
        }
        dispatch(addFriend({name, handle}));
        setName("");
        setHandle("");
    }
    return (
    <div className="flex max-w-100">
        <Input className="mr-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input className="mr-2" placeholder="Handle" value={handle} onChange={(e) => setHandle(e.target.value)} />
        <Button onClick={handleAdd}>Add</Button>
    </div>
    );
}

export default function Friends(){
    const friends = useSelector((state: RootState) => state.profile.list);
    const dispatch = useDispatch();
    function removeHandler(handle: string){
        dispatch(removeFriend(handle));
    }
    return (
    <>
        <h3>Friend List</h3>
        {friends.length && 
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Alias</TableHead>
                    <TableHead>Handle</TableHead>
                    <TableHead className="text-right"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {friends.map((f: FriendData) => ( 
                    <TableRow key={f.handle}>
                        <TableCell>{f.name}</TableCell>
                        <TableCell>{f.handle}</TableCell>
                        <TableCell>
                            <Button onClick={removeHandler.bind(null, f.handle)}>Remove</Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table> || <p>Add a friend to have them appear in your friend list</p>}
        <div className="mt-2">
            <FriendAdder />
        </div>
    </>
    );
}