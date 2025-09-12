import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function chunk(arr: any[], size: number) {
  return arr.reduce((acc, _, i) => {
    if (i % size === 0) acc.push(arr.slice(i, i + size));
    return acc;
  }, []);
}

export function validHandle(handle: string){
  return  /^[a-zA-Z0-9_]{3,16}$/.test(handle);
}

export function validToken(token: string){
  return /^\$2[a-y]?\$[0-9]{2}\$[A-Za-z0-9./]{53}$/.test(token);
}

export function aiPlayerTitle(skillLevel: number){
    switch(skillLevel){
        case 1: return "Novice";
        case 2: return "Advanced";
        case 3: return "Hardest";
        default: "Invalid";
    }
}