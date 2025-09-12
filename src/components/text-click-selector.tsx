import { useRef } from 'react';

export type TextClickSelectorProps = {
    text: string;
    type?: string; 
}

function TextClickSelector(props:TextClickSelectorProps) {
    const textRef = useRef(null);

    const handleDivClick = () => {
        if(! textRef.current) return;
        const range = document.createRange();
        range.selectNodeContents(textRef.current);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
    };
    //style={{ border: '1px solid #ccc', padding: '10px', cursor: 'pointer' }}
    if(props.type == "code"){
        return (
            <code ref={textRef} onClick={handleDivClick} className="cursor-pointer border-1 text-console bg-gray-50 p-1">
                {props.text}    
            </code>
        );
    }
    return (
        <div ref={textRef} onClick={handleDivClick} className="cursor-pointer border-1 text-console bg-gray-50 pl-2 p-1">
            {props.text}    
        </div>
    );
}

export default TextClickSelector;