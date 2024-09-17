import React, { useState, useEffect, useRef } from 'react';
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
    const speakerSelectRef = useRef<HTMLSelectElement>(null);
    const positionSelectRef = useRef<HTMLSelectElement>(null);

    const [selectedPosition, setSelectedPosition] = useState(0);
    const [selectedSpeaker, setSelectedSpeaker] = useState(0);

    const handlePositionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newSelectedPosition = Number(event.target.value);
        setSelectedPosition(newSelectedPosition);
    };

    const handleSpeakerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newSelectedSpeaker = Number(event.target.value);
        setSelectedSpeaker(newSelectedSpeaker);
        const newNodes = nodes.map((node) => {
            if (node.id === id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        speakerId: newSelectedSpeaker,
                    },
                };
            }
            return node;
        });
        setNodes(newNodes);
        console.log("selected position: ", selectedPosition, "selected speaker: ", newSelectedSpeaker);
    };

    useEffect(() => {
        if (speakerSelectRef.current) {
            speakerSelectRef.current.style.backgroundColor = diarizationColors[selectedSpeaker];
        }
    }, [selectedSpeaker, diarizationColors]);

    return (
        <div
            style={{ top, left }}
            className="absolute bg-white border border-gray-300 shadow-lg z-50 p-2 rounded-md"
            onClick={(event: React.MouseEvent) => {
                event.stopPropagation();
            }}
            {...props}
        >
            This block is
            <select
                ref={positionSelectRef}
                value={selectedPosition}
                onChange={handlePositionChange}
                className="block w-full p-2 my-1 bg-gray-100 rounded-md"
            >
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

            presented by

            {selectedPosition === -1 ? (
                <span className="block w-full p-2 my-1 bg-gray-300 rounded-md">None</span>
            ) : (
                <select
                    ref={speakerSelectRef}
                    value={selectedSpeaker}
                    onChange={handleSpeakerChange}
                    className="block w-full p-2 my-1 bg-gray-100 rounded-md"
                >
                    <option value={1} style={{ backgroundColor: diarizationColors[1] }}>SPEAKER_01</option>
                    <option value={2} style={{ backgroundColor: diarizationColors[2] }}>SPEAKER_02</option>
                    <option value={3} style={{ backgroundColor: diarizationColors[3] }}>SPEAKER_03</option>
                    <option value={4} style={{ backgroundColor: diarizationColors[4] }}>SPEAKER_04</option>
                    <option value={5} style={{ backgroundColor: diarizationColors[5] }}>SPEAKER_05</option>
                    <option value={6} style={{ backgroundColor: diarizationColors[6] }}>SPEAKER_06</option>
                    <option value={7} style={{ backgroundColor: diarizationColors[7] }}>SPEAKER_07</option>
                    <option value={8} style={{ backgroundColor: diarizationColors[8] }}>SPEAKER_08</option>
                    <option value={9} style={{ backgroundColor: diarizationColors[9] }}>SPEAKER_09</option>
                    <option value={10} style={{ backgroundColor: diarizationColors[10] }}>SPEAKER_10</option>
                    <option value={11} style={{ backgroundColor: diarizationColors[11] }}>SPEAKER_11</option>
                    <option value={12} style={{ backgroundColor: diarizationColors[12] }}>SPEAKER_12</option>
                    <option value={13} style={{ backgroundColor: diarizationColors[13] }}>SPEAKER_13</option>
                    <option value={14} style={{ backgroundColor: diarizationColors[14] }}>SPEAKER_14</option>
                    <option value={15} style={{ backgroundColor: diarizationColors[15] }}>SPEAKER_15</option>
                    <option value={16} style={{ backgroundColor: diarizationColors[16] }}>SPEAKER_16</option>
                    <option value={17} style={{ backgroundColor: diarizationColors[17] }}>SPEAKER_17</option>
                    <option value={18} style={{ backgroundColor: diarizationColors[18] }}>SPEAKER_18</option>
                    <option value={19} style={{ backgroundColor: diarizationColors[19] }}>SPEAKER_19</option>
                    <option value={20} style={{ backgroundColor: diarizationColors[20] }}>SPEAKER_20</option>
                </select>
            )}
        </div>
    );
}

export default MenuAsr;