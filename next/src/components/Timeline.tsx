import React, { useEffect, useState, useCallback, useRef, use } from 'react';
import { ReactFlow, Background, BackgroundVariant, SelectionMode } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Papa from 'papaparse';

import NodeAsr from './NodeAsr';
import NodeTimeLabel from './NodeTimeLabel';
import NodeDiarization from './NodeDiarization';

import MenuAsr from './MenuAsr';

import nodeIdToNumber from '../utils/nodeIdToNumber';

import { useAppContext } from '../context/context';

interface Node {
    id: string;
    data: any;
    position: {
        x: number;
        y: number;
    };
    type: string; // typeは存在しない可能性があるのでオプションにする
}

interface Asr {
    start: number;
    end: number;
    text: string;
}

interface Diarization {
    start: number;
    end: number;
    speaker: number;
}

interface MenuDiarizationProps {
    id: string;
    top: number;
    left: number;
    right: number;
    bottom: number;
    nodeData: any;
    type: string;
    [key: string]: any; // その他のプロパティを許可
}

//文字起こしデータの取得・設定
const Timeline = () => {
    const nodeWidth = 1000;
    const diarizationWidth = 20;
    const zoomLevel = 10;

    const [asrs, setAsrs] = React.useState<Asr[]>([]);
    const [diarizations, setDiarizations] = React.useState<Diarization[]>([]);

    //style
    const [isNA, setIsNA] = useState(false);

    // Asr
    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('/test-data/output_asr-0907/soturon/The Kansai 2018 R4.mp3.csv');
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            if (!response.body) {
                throw new Error('Response body is null');
            }
            const reader = response.body.getReader();
            const result = await reader.read(); // raw array
            const decoder = new TextDecoder('utf-8');
            const csv = decoder.decode(result.value); // CSV text
            const parsedData = Papa.parse<Asr>(csv, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true
            }); // Parse CSV

            // データの整形
            const formattedData = parsedData.data
                .filter(item => !isNaN(Number(item.start)) && !isNaN(Number(item.end))) // Filter out invalid entries
                .map((item) => ({
                    start: item.start,
                    end: item.end,
                    text: item.text // Assuming item.text is the correct value
                }));

            setAsrs(formattedData); // Store data in state
        };

        fetchData();
    }, []);

    const initialAsrNodes = asrs.map((asr, index) => {
        return {
            id: `asr-${index}`,
            type: 'NodeAsr',
            data: { text: asr.text, start: asr.start, end: asr.end, positionId: -1, isPoi: false },
            position: { x: 70, y: zoomLevel * asr.start },
        };
    });

    // Diarization
    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('/test-data/output_diarization/soturon/The Kansai 2018 R4.csv');
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            if (!response.body) {
                throw new Error('Response body is null');
            }
            const reader = response.body.getReader();
            const result = await reader.read(); // raw array
            const decoder = new TextDecoder('utf-8');
            const csv = decoder.decode(result.value); // CSV text
            const parsedData = Papa.parse<Diarization>(csv, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true
            }); // Parse CSV

            // データの整形
            const formattedData = parsedData.data
                .filter(item => !isNaN(Number(item.start)) && !isNaN(Number(item.end))) // Filter out invalid entries
                .map((item) => {
                    const speakerString = String(item.speaker) || ''; // Ensure speaker is a string
                    const speakerNumber = parseInt(speakerString.match(/\d+/)?.[0] || '-1', 10); // Extract number from speaker string
                    return {
                        start: item.start,
                        end: item.end,
                        speaker: speakerNumber
                    };
                })
                .filter(item => item.speaker !== -1); // Filter out entries with invalid speaker numbers

            setDiarizations(formattedData); // Store data in state
        };

        fetchData();
    }, []);

    const diarizationNodes = diarizations.map((diarization, index) => {
        return {
            id: `dia-${index}`,
            type: 'NodeDiarization',
            data: { speakerId: diarization.speaker, width: diarizationWidth, height: zoomLevel * (diarization.end - diarization.start) },
            position: { x: 80 + nodeWidth + 5 * diarization.speaker, y: zoomLevel * diarization.start },
        };
    });

    // Time Label
    const timeLabels: Node[] = [];
    const interval = 5;
    const duration = 180 * zoomLevel

    for (let i = 0; i <= duration; i += interval) {
        timeLabels.push({
            id: `tl-${i + 1}`,
            type: 'NodeTimeLabel',
            data: { seconds: i * 60 / zoomLevel },
            position: { x: 0, y: -13 + i * 60 },
        });
    }

    //Initialize all nodes
    const [nodes, setNodes] = useState<Node[]>([]);

    useEffect(() => {
        setNodes([...timeLabels, ...diarizationNodes, ...initialAsrNodes]);
    }, [asrs, diarizations]);

    //Menus
    const [menu, setMenu] = useState<MenuDiarizationProps | null>(null);
    const [rightMenu, setRightMenu] = useState<MenuDiarizationProps | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    const onNodeClick = useCallback(
        (event: React.MouseEvent, node: any) => {
            // Prevent native context menu from showing
            event.preventDefault();

            if (ref.current === null) {
                console.error('Ref is null');
                return;
            }
            const pane = ref.current.getBoundingClientRect();

            if (node.type === 'NodeAsr') {
                // Node 1用のメニューを表示
                setMenu({
                    id: node.id,
                    top: event.clientY,
                    left: event.clientX,
                    right: pane.width - event.clientX,
                    bottom: pane.height - event.clientY,
                    nodeData: node.data,
                    type: 'MenuAsr'
                });
            } else if (node.type === 'NodeDiarization') {
                // Node 2用のメニューを表示
                setMenu({
                    id: node.id,
                    top: event.clientY,
                    left: event.clientX,
                    right: pane.width - event.clientX,
                    bottom: pane.height - event.clientY,
                    nodeData: node.data,
                    type: 'MenuDiarization'
                });
            }

        },
        [setMenu],
    );

    const onNodeContextMenu = useCallback(
        (event: React.MouseEvent, node: any) => {
            event.preventDefault();
            console.log('Node Context Menu');
        },
        [setRightMenu],
    );

    // Diarization Datas
    const [asrDiars, setAsrDiars] = useState<any[]>([
        { positionId: 0, start: undefined, end: undefined }, //PM
        { positionId: 1, start: undefined, end: undefined }, //LO
        { positionId: 2, start: undefined, end: undefined }, //DPM
        { positionId: 3, start: undefined, end: undefined }, //DLO
        { positionId: 4, start: undefined, end: undefined }, //GW
        { positionId: 5, start: undefined, end: undefined }, //OW
        { positionId: 6, start: undefined, end: undefined }, //LOR
        { positionId: 7, start: undefined, end: undefined }, //PMR
    ]);

    const { pois, setPois } = useAppContext();

    useEffect(() => {
        // やっぱり重いし遅い
        const newNodes = nodes.map((node) => {
            const id = nodeIdToNumber(node.id);
            if (node.type === 'NodeAsr') {
                // node.id が条件を満たすすべての asrDiar を抽出
                const matchingAsrDiars = asrDiars.filter((asrDiar) =>
                    (nodeIdToNumber(asrDiar.start) <= id && id <= nodeIdToNumber(asrDiar.end)) ||
                    id === nodeIdToNumber(asrDiar.start) ||
                    id === nodeIdToNumber(asrDiar.end)
                );

                // 一致する positionId のリストを作成
                const positionIds = matchingAsrDiars.map((asrDiar) => asrDiar.positionId);

                // positionId を更新するロジック (例として最初の positionId を使用)
                const positionId = positionIds.length > 0 ? positionIds[0] : -1;

                const isPoi = pois.includes(id);

                return {
                    ...node,
                    data: {
                        ...node.data,
                        positionId,
                        isPoi,
                    },
                };
            }
            return node;
        });

        setNodes(newNodes);

    }, [asrDiars, pois]);

    //util
    const [previousIsTop, setPreviousIsTop] = useState(true);

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <ReactFlow
                ref={ref}
                nodes={nodes}
                nodeTypes={{ NodeAsr: NodeAsr, NodeTimeLabel: NodeTimeLabel, NodeDiarization: NodeDiarization }}
                onPaneClick={() => setMenu(null)}
                panOnScroll
                onNodeClick={(event, node) => {
                    onNodeClick(event, node);// ノードがクリックされたときはメニューを閉じない
                    event.stopPropagation(); // 親要素へのクリックイベント伝播を止める
                }}
                onNodeContextMenu={onNodeContextMenu}
            >
                <Background
                    variant={BackgroundVariant.Lines}
                    gap={[10000, 60]}
                    lineWidth={2}
                />
            </ReactFlow>
            {/* ReactFlow外にMenuを移動 */}
            {menu && menu.type === 'MenuAsr' && <MenuAsr setMenu={setMenu} asrDiars={asrDiars} setAsrDiars={setAsrDiars} previousIsTop={previousIsTop} setPreviousIsTop={setPreviousIsTop} {...menu} />}
            <div
                onClick={() => setIsNA(!isNA)}
                style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    color: '#1a73e8',
                    padding: '0px 10px',
                    borderRadius: '5px',
                    transition: 'background-color 0.3s, color 0.3s',
                    zIndex: 1000,
                    fontSize: '20px',
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
                <span style={{ color: '#1a73e8', fontWeight: 'bold' }}>{isNA ? 'North American' : 'Asian'}</span>
                <span style={{ color: 'black' }}> style</span>
            </div>
        </div>
    );
};

export default Timeline;