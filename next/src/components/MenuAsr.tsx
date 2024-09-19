import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import speechIdToPositionName from '../utils/speechIdToPositionName';
import nodeIdToNumber from '../utils/nodeIdToNumber';

import { useAppContext } from '../context/context';

interface ContextMenuProps {
    id: string;
    top: number;
    left: number;
    right: number;
    bottom: number;
    nodeData: any;
    type: string;
    setMenu: React.Dispatch<React.SetStateAction<any>>;
    asrDiars: any;
    setAsrDiars: React.Dispatch<React.SetStateAction<any>>;
    previousIsTop: boolean;
    setPreviousIsTop: React.Dispatch<React.SetStateAction<boolean>>;
    [key: string]: any;
}

function MenuAsr({ id, top, left, right, bottom, nodeData, type, setMenu, asrDiars, setAsrDiars, previousIsTop, setPreviousIsTop, ...props }: ContextMenuProps) {
    const [isTop, setIsTop] = useState(!previousIsTop);
    const [selectedPosition, setSelectedPosition] = useState(-1);
    const { pois, setPois } = useAppContext();

    const handlePositionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newSelectedPosition = Number(event.target.value);
        setSelectedPosition(newSelectedPosition);

        // validation
        // if(nodeIdToNumber(asrDiars[newSelectedPosition-1]?.start) >= nodeIdToNumber(id) || nodeIdToNumber(asrDiars[-1]?.end) >= nodeIdToNumber(id)){
        //     console.error("Node cannot belong to more than two speeches.");
        //     toast.error("Node can't belong to 2 speeches.")
        //     return;
        // }
        // やるんなら徹底的にやらないとデッドロックになる

        if (newSelectedPosition == -2) { //POIの設定
            setPois(pois.concat(nodeIdToNumber(id))); //push(id) を使うのではなく、setPois(pois.concat(id)) のように新しい配列を作成して状態を更新すべき
            //このidは歯抜けがあると最終的な出力のidとは一致しないことに注意
            //そう考えるとやはり、最終的な出力はノードを直接走査して取得すべきだな
            toast.success(
                <span>
                    <strong>{id}</strong> is set as POI.
                </span>,
                { duration: 5000 }
            );
            setMenu(null);
            return;
        } else {
            setAsrDiars(asrDiars.map((asrDiars: any) => {
                if (asrDiars.positionId === newSelectedPosition) {
                    if (isTop) {
                        return {
                            ...asrDiars,
                            start: id,
                        };
                    } else {
                        return {
                            ...asrDiars,
                            end: id,
                        };
                    }
                }
                return asrDiars;
            }));

            toast.success(
                <span>
                    <strong>{id}</strong> is set as <strong>{speechIdToPositionName[newSelectedPosition]}</strong>'s <strong>{isTop ? "top" : "last"}</strong> seg.
                </span>,
                { duration: 5000 }
            );

            setPreviousIsTop(isTop);
            setMenu(null);
        }
    };

    return (
        <div
            style={{ top, left }}
            className="absolute bg-white border border-gray-300 shadow-lg z-50 p-2 rounded-md"
            onClick={(event: React.MouseEvent) => {
                event.stopPropagation();
            }}
            {...props}
        >
            <div
                onClick={() => setIsTop(!isTop)}
                style={{
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    color: '#1a73e8',
                    padding: '0px 10px',
                    borderRadius: '5px',
                    transition: 'background-color 0.3s, color 0.3s',
                }}
                onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f1f3f4';
                    (e.currentTarget as HTMLDivElement).style.color = '#0b66c3';
                }}
                onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = 'white';
                    (e.currentTarget as HTMLDivElement).style.color = '#1a73e8';
                }}
            >
                <span style={{ color: 'black' }}>It's </span>
                <span style={{ color: '#1a73e8', fontWeight: 'bold' }}>{isTop ? 'top' : 'last'}</span>
                <span style={{ color: 'black' }}> seg of</span>
            </div>
            <select
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
                <option value={-2}>POI</option>
            </select>

        </div>
    );
}
export default MenuAsr;