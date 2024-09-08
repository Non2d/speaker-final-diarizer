import React, { useState, useEffect } from 'react';
import { Text, ZoomIn, ZoomOut, ChevronDown, ChevronUp } from 'lucide-react';

interface Segment {
  start: number; // startを数値に変更
  content: string;
}

interface ExpandedGroups {
  [key: number]: boolean;
}

const TimelineMeetingSegments: React.FC = () => {
  const [segments, setSegments] = useState<Segment[]>([
    { start: 0.0, content: 'Thank you, chair. We believe that selective married couple surnames are essential for gender equality.' },
    { start: 3.7, content: 'In many countries, this practice is already in place and has shown positive results.' },
    { start: 12.5, content: "What we're gonna do is present the benefits of allowing couples to choose their surnames." },
    { start: 27.8, content: "I agree, let's start with the historical context and current legal framework." },
    { start: 34.2, content: "Can I add a point here? The current system often forces one partner to give up their identity." },
    { start: 48.9, content: 'Firstly, we think that allowing selective surnames will promote individual identity and equality.' },
    { start: 53.4, content: 'Moreover, it can reduce administrative burdens and conflicts in international marriages.' },
    { start: 67.1, content: 'In addition, children can benefit from a more inclusive family identity.' },
    { start: 72.6, content: 'Opponents argue that it could lead to confusion, but evidence suggests otherwise.' },
    { start: 85.3, content: 'For example, countries like Spain and Portugal have successfully implemented this system.' },
    { start: 92.7, content: 'Furthermore, surveys indicate strong public support for this change.' },
    { start: 108.4, content: 'In conclusion, selective married couple surnames are a step towards a more equitable society.' },
    { start: 115.9, content: 'Thank you for your attention. We are open to questions and further discussion.' },
  ]);

  const [newSegment, setNewSegment] = useState<Segment>({ start: 0, content: '' });
  const [totalDuration, setTotalDuration] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
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
    if (newSegment.start && newSegment.content) {
      const newSegments = [...segments, newSegment].sort((a, b) => a.start - b.start);
      setSegments(newSegments);
      setNewSegment({ start: 0, content: '' });
    }
  };

  const calculatePosition = (start: number): number => {
    return (start / totalDuration) * 100;
  };

  const zoomIn = (): void => setZoomLevel(prev => Math.min(prev * 1.2, 5));
  const zoomOut = (): void => setZoomLevel(prev => Math.max(prev / 1.2, 0.5));

  const groupOverlappingSegments = (): Segment[][] => {
    const groups: Segment[][] = [];
    let currentGroup: Segment[] = [];

    segments.forEach((segment, index) => {
      if (index !== 0 && segment.start - segments[index - 1].start <= 10/(zoomLevel+1)) {
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
          value={newSegment.content}
          onChange={(e) => setNewSegment({ ...newSegment, content: e.target.value })}
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

      <div className="relative border-l-2 border-blue-200" style={{ height: '100vh' }}>
        {groupedSegments.map((group, groupIndex) => (
          <div key={groupIndex} className="absolute w-full"
            style={{ top: `${calculatePosition(group[0].start) * zoomLevel}%` }}>
            {/* タイムライン上の点 */}
            <div className="absolute w-3 h-3 bg-gray-200 rounded-full -left-1.5 border border-white" />

            {/* 開始時刻の表示 */}
            <time className="absolute mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500 w-20"
              style={{ top: '50%', transform: 'translateY(-50%)' }}>
              {formatTime(group[0].start)}
            </time>

            <div className="flex ml-4">
              <div className="flex flex-col ml-4 w-full">
                {group.length === 1 ? (
                  <div className="bg-white p-4 rounded shadow">
                    <span className="absolute top-0 left-0 w-full h-0.5 bg-gray-100"></span>
                    <Text className="inline-block mr-2" size={18} />
                    <p className="text-base font-normal text-gray-500 dark:text-gray-400 inline">
                      {group[0].content}
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
                          {segment.content}
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
