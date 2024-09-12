import React, { useState, useEffect, useContext } from 'react';
import { Text, ZoomIn, ZoomOut, ChevronDown, ChevronUp } from 'lucide-react';
import Papa from 'papaparse';
import { ZoomContext } from '../app/page';

interface Segment {
  start: number; // startを数値に変更
  end: number; // endを追加
  text: string;
}

interface ExpandedGroups {
  [key: number]: boolean;
}

const TimelineMeetingSegments: React.FC = () => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [zoomLevel, setZoomLevel] = useContext(ZoomContext);

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
      const parsedData = Papa.parse<Segment>(csv, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true
      }); // Parse CSV

      // データの整形
      const formattedData = parsedData.data.map((item) => ({
        start: item.start,
        end: item.end,
        text: item.text // Assuming item.text is the correct value
      }));

      setSegments(formattedData); // Store data in state

      console.log(formattedData); // Log data to console
    };

    fetchData();
  }, []);

  const [newSegment, setNewSegment] = useState<Segment>({ start: 0, end: 1, text: '' });
  const [totalDuration, setTotalDuration] = useState<number>(1);
  const [expandedGroups, setExpandedGroups] = useState<ExpandedGroups>({});

  useEffect(() => {
    const maxTime = Math.max(...segments.map(s => s.start));
    setTotalDuration(maxTime);
  }, [segments]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return `${mins}:${secs.padStart(5, '0')}`;
  };

  const addSegment = (): void => {
    if (newSegment.start && newSegment.text) {
      const newSegments = [...segments, newSegment].sort((a, b) => a.start - b.start);
      setSegments(newSegments);
      setNewSegment({ start: 0, end: 1, text: '' });
    }
  };

  const calculatePosition = (start: number): number => {
    return (start / totalDuration) * 100;
  };

  const zoomIn = (): void => setZoomLevel(prev => Math.min(prev * 1.2, 500));
  const zoomOut = (): void => setZoomLevel(prev => Math.max(prev / 1.2, 0.1));

  const groupOverlappingSegments = (): Segment[][] => {
    const groups: Segment[][] = [];
    let currentGroup: Segment[] = [];

    segments.forEach((segment, index) => {
      if (index !== 0 && segment.start - segments[index - 1].start <= 70 / (zoomLevel + 1)) {
        currentGroup.push(segment);
      } else {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = [segment];
      }
    });

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  };

  const toggleGroup = (index: number): void => {
    setExpandedGroups(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const groupedSegments = groupOverlappingSegments();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Timeline Meeting Segments</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Start time (e.g. 90)"
          className="border p-2 mr-2"
          value={newSegment.start}
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            setNewSegment({ ...newSegment, start: isNaN(value) ? 0 : value });
          }}
        />
        <input
          type="text"
          placeholder="Segment content"
          className="border p-2 mr-2"
          value={newSegment.text}
          onChange={(e) => setNewSegment({ ...newSegment, text: e.target.value })}
        />
        <button onClick={addSegment} className="bg-blue-500 text-white p-2 rounded">
          Add Segment
        </button>
      </div>

      <div className="mb-4">
        <button onClick={zoomIn} className="bg-green-500 text-white p-2 rounded mr-2">
          <ZoomIn size={18} />
        </button>
        <button onClick={zoomOut} className="bg-red-500 text-white p-2 rounded">
          <ZoomOut size={18} />
        </button>
        <span className="ml-2">Zoom: {zoomLevel.toFixed(1)}x</span>
      </div>

      <div className="relative border-l-2 border-red-400" style={{ height: '100vh' }}>
        {groupedSegments.map((group, groupIndex) => (
          <div key={groupIndex} className="absolute w-full"
            style={{ top: `${calculatePosition(group[0].start) * zoomLevel}%` }}>
            {/* タイムライン上の点 */}
            <div className="absolute w-3 h-3 bg-gray-200 rounded-full -left-1.5 border border-white" />

            {/* 開始時刻の表示 */}
            <time className="absolute text-2sm font-normal leading-none text-gray-400 dark:text-gray-500 w-20"
              style={{ left: '-5rem' }}>
              {formatTime(group[0].start)}
            </time>

            <div className="flex ml-4">
              <div className="flex flex-col ml-4 w-full">
                {group.length === 1 ? (
                  <div className="bg-white p-4 rounded shadow">
                    <span className="absolute top-0 left-0 w-full h-0.5 bg-gray-100"></span>
                    <Text className="inline-block mr-2" size={18} />
                    <p className="text-base font-normal text-gray-500 dark:text-gray-400 inline">
                      {group[0].text}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="bg-white p-4 rounded shadow flex justify-between items-center cursor-pointer"
                      onClick={() => toggleGroup(groupIndex)}>
                      <span className="absolute top-0 left-0 w-full h-0.5 bg-gray-100"></span>
                      <span>{group.length} argument units</span>
                      {expandedGroups[groupIndex] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                    {expandedGroups[groupIndex] && group.map((segment, index) => (
                      <div key={index} className="bg-white p-4 rounded shadow mt-2 ml-4">
                        <span className="absolute top-0 left-0 w-full h-0.5 bg-gray-100"></span>
                        <Text className="inline-block mr-2" size={18} />
                        <p className="text-base font-normal text-gray-500 dark:text-gray-400 inline">
                          {segment.text}
                        </p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineMeetingSegments;
