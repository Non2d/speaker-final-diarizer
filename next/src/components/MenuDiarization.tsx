import React, { useState } from 'react';
import diarizationColors from '../utils/DiarizationColors';

interface ContextMenuProps {
    id: string;
    top: number;
    left: number;
    right: number;
    bottom: number;
    label: number;
    [key: string]: any; // その他のプロパティを許可
}

function MenuDiarization({ id, top, left, right, bottom, label, ...props }: ContextMenuProps) {
    const color = diarizationColors[label % 20];
    const [selectedOption, setSelectedOption] = useState(1);

    const registerColorAsSpeaker = async () => {
        
    };

    const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(Number(event.target.value));
    };

    const handleClick = (event: React.MouseEvent) => {
        event.stopPropagation();
    }

    return (
        <div
            style={{ top, left }}
            className="absolute bg-white border border-gray-300 shadow-lg z-50 p-2 rounded-md"
            onClick={handleClick}
            {...props}
        >
            <p className="m-2">
                Block <span style={{ display: 'inline-block', width: '20px', height: '20px', backgroundColor: color }}></span> is
            </p>

            <select
                value={selectedOption}
                onChange={handleOptionChange}
                className="block w-full p-2 my-1 bg-gray-100 rounded-md"
            >
                <option value={0}>PM</option>
                <option value={1}>LO</option>
                <option value={2}>DPM/MG</option>
                <option value={3}>DLO/MO</option>
                <option value={4}>GW</option>
                <option value={5}>OW</option>
                <option value={6}>LOR</option>
                <option value={7}>PMR</option>
            </select>

            <button
                onClick={registerColorAsSpeaker}
                className="block w-full p-2 my-1 bg-gray-100 rounded-md hover:bg-gray-200"
            >
                Confirm
            </button>
        </div>
    );
}

export default MenuDiarization;