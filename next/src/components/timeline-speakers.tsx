import React from 'react';
import { ZoomContext } from '../app/page';
import { useState, useEffect, useContext } from 'react';
import Papa from 'papaparse';

interface DiarizationRawSpeaker {
    start: number;
    end: number;
    speaker: string;
}

interface Diarization {
    start: number;
    end: number;
    speaker: number;
}

const TimelineSpeakers = () => {
    const [zoomLevel] = useContext(ZoomContext); //分割代入で値のみ取得。set関数はここでは使わない。

    const [diarizations, setDiarizations] = useState<Diarization[]>([]);
    const [barPositions, setBarPositions] = useState<{ [key: string]: [number, number][] }>({});

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
            const parsedData = Papa.parse<DiarizationRawSpeaker>(csv, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true
            }); // Parse CSV

            // データの整形
            const formattedData = parsedData.data.map((item) => {
                const speakerString = item.speaker || ''; // Ensure speaker is a string
                const speakerNumber = parseInt(speakerString.match(/\d+/)?.[0] || '0', 10); // Extract number from speaker string
                return {
                    start: item.start,
                    end: item.end,
                    speaker: speakerNumber
                };
            });

            setDiarizations(formattedData); // Store data in state

            console.log(formattedData); // Log data to console
        };

        fetchData();
    }, []);

    useEffect(() => {
        const newBarPositions: { [key: string]: [number, number][] } = {};

        diarizations.forEach((item) => {
            const color = getColorForSpeaker(item.speaker); // Define this function to map speaker number to color
            if (!newBarPositions[color]) {
                newBarPositions[color] = [];
            }
            newBarPositions[color].push([item.start, item.end]);
        });

        setBarPositions(newBarPositions);
    }, [diarizations]);

    const getColorForSpeaker = (speaker: number): string => {
        const colors = ['red', 'blue', 'green', 'orange', 'purple', 'pink', 'cyan', 'magenta', 'lime'];
        return colors[speaker % colors.length];
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', marginTop: '170px' }}>
            {Object.entries(barPositions).map(([color, positions], colorIndex) =>
                positions.map(([start, end], index) => (
                    <div key={`${color}-${index}`} style={{ position: 'relative' }}>
                        <div
                            style={{
                                position: 'absolute',
                                left: `${colorIndex * 30}px`, // 横座標を広げる
                                top: `${start * zoomLevel*0.55}px`, // 始点をずらす
                                width: '7px',
                                height: `${(end - start) * zoomLevel*0.55}px`, // 高さを終了位置と開始位置の差で計算
                                backgroundColor: color
                            }}
                        />
                        {/* {index === 0 && (
                            <div
                                style={{
                                    position: 'absolute',
                                    left: `${colorIndex * 30 - 5}px`, // 横座標を調整
                                    top: `${start - 30}px`, // 数字を棒の上に表示
                                    width: '17px', // テキストの幅を広げる
                                    textAlign: 'center', // テキストをセンター揃え
                                    color: 'gray',
                                    fontSize: '25px'
                                }}
                            >
                                {colorIndex + 1}
                            </div>
                        )} */}
                    </div>
                ))
            )}
        </div>
    );
}

export default TimelineSpeakers;