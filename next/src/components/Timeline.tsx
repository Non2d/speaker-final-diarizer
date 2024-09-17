import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ReactFlow, Background, BackgroundVariant, SelectionMode } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Papa from 'papaparse';

import NodeAsr from './NodeAsr';
import NodeTimeLabel from './NodeTimeLabel';
import NodeDiarization from './NodeDiarization';

import MenuDiarization from './MenuDiarization';
import MenuAsr from './MenuAsr';

import diarizationColors from '../utils/DiarizationColors';

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

interface SpeakerData {
    positionId: number;
    diarizationId: number;
}

//文字起こしデータの取得・設定
const Timeline = () => {
    const nodeWidth = 1000;
    const diarizationWidth = 20;
    const zoomLevel = 10;

    const [asrs, setAsrs] = React.useState<Asr[]>([]);
    const [diarizations, setDiarizations] = React.useState<Diarization[]>([]);

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
            data: { text: asr.text, start: asr.start, end: asr.end, diarizationId: -1 },
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
    const ref = useRef<HTMLDivElement>(null);

    const onNodeContextMenu = useCallback(
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

    // Diarization Datas
    const [speakerDatas, setSpeakerDatas] = useState<SpeakerData[]>([
        { positionId: 0, diarizationId: 7 },
        { positionId: 1, diarizationId: 6 },
        { positionId: 2, diarizationId: 5 },
        { positionId: 3, diarizationId: 4 },
        { positionId: 4, diarizationId: 3 },
        { positionId: 5, diarizationId: 2 },
        { positionId: 6, diarizationId: 1 },
        { positionId: 7, diarizationId: 0 },
    ]);

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <ReactFlow
                ref={ref}
                nodes={nodes}
                nodeTypes={{ NodeAsr: NodeAsr, NodeTimeLabel: NodeTimeLabel, NodeDiarization: NodeDiarization }}
                onClick={() => setMenu(null)}
                panOnScroll
                onNodeContextMenu={onNodeContextMenu}
            >
                <Background
                    variant={BackgroundVariant.Lines}
                    gap={[100000, 60]}
                    lineWidth={2}
                />
            </ReactFlow>
            {/* ReactFlow外にMenuを移動 */}
            {menu && menu.type === 'MenuAsr' && <MenuAsr nodes={nodes} setNodes={setNodes} speakerDatas={speakerDatas} setSpeakerDatas={setSpeakerDatas} {...menu} />}
        </div>
    );
};

export default Timeline;