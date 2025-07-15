
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { addFriend, removeFriend, type FriendData } from "@/store/friendsSlice";
import type { RootState } from "@/store";


import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function FriendAdder(){
    const friends = useSelector((state: RootState) => state.friends.list);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const dispatch = useDispatch();

    function handleAdd(){
        if(friends.find((f: FriendData) => f.email == email) != null){
            // TODO: make existing row flash
            return; 
        }    
        dispatch(addFriend({name, email}));
    }
    return (
    <div className="flex max-w-100">
        <Input className="mr-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input className="mr-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button onClick={handleAdd}>Add</Button>
    </div>
    );
}

export default function Friends(){
    const friends = useSelector((state: RootState) => state.friends.list);
    const dispatch = useDispatch();
    function removeHandler(email: string){
        dispatch(removeFriend(email));
    }
    return (
    <>
        <h1>Friend List</h1>
        {friends.length && 
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {friends.map((f: FriendData) => ( 
                    <TableRow>
                        <TableCell>{f.name}</TableCell>
                        <TableCell>{f.email}</TableCell>
                        <TableCell>
                            <Button onClick={removeHandler.bind(null, f.email)}>Remove</Button>
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