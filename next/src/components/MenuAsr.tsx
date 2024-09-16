import React, { useState, useRef } from 'react';
import diarizationColors from '../utils/DiarizationColors';

interface ContextMenuProps {
    id: string;
    top: number;
    left: number;
    right: number;
    bottom: number;
    nodeData: any;
    type: string;
    nodes: any[];
    setNodes: React.Dispatch<React.SetStateAction<any[]>>;
    [key: string]: any;
}

function MenuAsr({ id, top, left, right, bottom, nodeData, type, nodes, setNodes, ...props }: ContextMenuProps) {
    const color = diarizationColors[nodeData.label % 20];
    const [selectedOption, setSelectedOption] = useState(0);

    const registerBlockAsSpeaker = async () => {
        const newNodes = nodes.map((node) => {
            if (node.id === id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        speaker: selectedOption,
                    },
                };
            }
            return node;
        });
        setNodes(newNodes);
    };

    const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newSelectedOption = Number(event.target.value);
        setSelectedOption(newSelectedOption);
        const newNodes = nodes.map((node) => {
            if (node.id === id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        speaker: newSelectedOption,
                    },
                };
            }
            return node;
        });
        setNodes(newNodes);
    };

    const popupRef = useRef<Window | null>(null);

    const jumpVideo = () => {
        const youtubeUrl = `https://www.youtube.com/watch?v=tuxREnaOR5M&t=${Math.floor(nodeData.start)}s`;
        if (popupRef.current && !popupRef.current.closed) {
            popupRef.current.location.href = youtubeUrl;
            popupRef.current.focus();
        } else {
            popupRef.current = window.open(youtubeUrl, 'youtubePopup', 'width=800,height=600,scrollbars=no,resizable=no,left=1200,top=200');
        }
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
            This block is
            <select
                value={selectedOption}
                onChange={handleOptionChange}
                className="block w-full p-2 my-1 bg-gray-100 rounded-md"
            >
                {/* ここのvalueはMenuDiarizationで変更された値を反映させる */}
                <option value={0}>PM</option> 
                <option value={1}>LO</option>
                <option value={2}>DPM</option>
                <option value={3}>DLO</option>
                <option value={4}>GW</option>
                <option value={5}>OW</option>
                <option value={6}>LOR</option>
                <option value={7}>PMR</option>
                <option value={-1}>None</option>
            </select>

            <button
                onClick={jumpVideo}
                className="block w-full p-2 my-1 bg-red-600 rounded-md hover:bg-red-500"
            >
                <span style={{ color: 'white' }}>▶</span>
            </button>
        </div>
    );
}

export default MenuAsr;