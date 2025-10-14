export function generateChessboardPalette(board: "gray" | "stone", hilite: string){
    const highlightMap = {
        red: {
            light: 'bg-red-300',
            dark: 'bg-red-400',
            rlight: 'bg-radial from-red-100',
            rdark: 'bg-radial from-red-600',
            border: 'border-red-400',
        },
        amber: {
            light: 'bg-yellow-300',
            dark: 'bg-yellow-400',
            rlight: 'bg-radial from-yellow-100',
            rdark: 'bg-radial from-yellow-600',
            border: 'border-yellow-400',
        },
        lime: {
            light: 'bg-lime-300',
            dark: 'bg-lime-400',
            rlight: 'bg-radial from-lime-100',
            rdark: 'bg-radial from-lime-600',
            border: 'border-lime-400',
        },
        cyan: {
            light: 'bg-cyan-300',
            dark: 'bg-cyan-400',
            rlight: 'bg-radial from-cyan-100',
            rdark: 'bg-radial from-cyan-600',
            border: 'border-cyan-400',
        },
        blue: {
            light: 'bg-blue-300',
            dark: 'bg-blue-400',
            rlight: 'bg-radial from-blue-100',
            rdark: 'bg-radial from-blue-600',   
            border: 'border-blue-400',             
        },
        slate: {
            light: 'bg-slate-300',
            dark: 'bg-slate-400',
            rlight: 'bg-radial from-slate-100',
            rdark: 'bg-radial from-slate-600',    
            border: 'border-slate-400', 
        }
    };
    const hilightKey = hilite as keyof typeof highlightMap;
    const highlights = highlightMap[hilightKey] || highlightMap.lime;
    return {
        hlight: highlights.light,
        hdark: highlights.dark,
        light: board == "gray"? `bg-gray-300`: `bg-stone-200`,
        dark: board == "gray"? `bg-gray-400`: `bg-stone-300`,
        rlight: highlights.rlight,
        rdark: highlights.rdark,
        border: highlights.border
    }
}
