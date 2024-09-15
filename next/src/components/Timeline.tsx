import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ReactFlow, Background, BackgroundVariant, SelectionMode } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Papa from 'papaparse';

import NodeAsr from './NodeAsr';
import NodeTimeLabel from './NodeTimeLabel';
import NodeDiarization from './NodeDiarization';

import MenuDiarization from './MenuDiarization';
import diarizationColors from '../utils/DiarizationColors';

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
    label: number;
    [key: string]: any; // その他のプロパティを許可
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

    const asrNodes = asrs.map((asr, index) => {
        return {
            id: `asr-${index}`,
            type: 'NodeAsr',
            data: { label: asr.text, width: nodeWidth, height: zoomLevel * (asr.end - asr.start), borderWidth: 2, borderColor: diarizationColors[6], start: asr.start },
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
            data: { label: diarization.speaker, width: diarizationWidth, height: zoomLevel * (diarization.end - diarization.start) },
            position: { x: 80 + nodeWidth + 5 * diarization.speaker, y: zoomLevel * diarization.start },
        };
    });

    // Time Label
    const timeLabels = [];
    const interval = 5;
    const duration = 180 * zoomLevel

    for (let i = 0; i <= duration; i += interval) {
        timeLabels.push({
            id: `tl-${i + 1}`,
            type: 'NodeTimeLabel',
            position: { x: 0, y: -13 + i * 60 },
            data: { seconds: i * 60 / zoomLevel },
        });
    }

    //Integrate all nodes
    const nodes = [...timeLabels, ...diarizationNodes, ...asrNodes];

    //Menus
    const [menu, setMenu] = useState<MenuDiarizationProps | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    const onNodeContextMenu = useCallback(
        (event: React.MouseEvent, node: any) => {
            // Prevent native context menu from showing
            event.preventDefault();

            if (node.type === 'NodeAsr') {
                // Node 1用のメニューを表示
            } else if (node.type === 'NodeDiarization') {
                // Node 2用のメニューを表示

                if (ref.current === null) {
                    console.error('Ref is null');
                    return;
                }
                const pane = ref.current.getBoundingClientRect();
                setMenu({
                    id: node.id,
                    top: event.clientY,
                    left: event.clientX,
                    right: pane.width - event.clientX,
                    bottom: pane.height - event.clientY,
                    label: node.data.label
                });
            }
            
        },
        [setMenu],
    );

    const onClick = useCallback(() => setMenu(null), [setMenu]);

    // settings
    const panOnDrag = [1, 2];

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <ReactFlow
                ref={ref}
                nodes={nodes}
                nodeTypes={{ NodeAsr: NodeAsr, NodeTimeLabel: NodeTimeLabel, NodeDiarization: NodeDiarization }}
                panOnScroll
                selectionOnDrag
                panOnDrag={panOnDrag}
                onClick={onClick}
                onNodeContextMenu={onNodeContextMenu}
            >
                <Background
                    variant={BackgroundVariant.Lines}
                    gap={[100000, 60]}
                    lineWidth={2}
                />
                {menu && <MenuDiarization {...menu} />}
            </ReactFlow>
        </div>
    );
};

export default Timeline;