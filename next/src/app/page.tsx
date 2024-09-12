"use client";

import { createContext, useState, Dispatch, SetStateAction } from 'react';
import TimelineMeetingMinutes from '../components/timeline-meeting-minutes';
import TimelineSpeakers from '../components/timeline-speakers';

type ZoomContextType = [number, Dispatch<SetStateAction<number>>];
export const ZoomContext = createContext<ZoomContextType>([1, () => {}]);

export default function Home() {
  const [zoomLevel, setZoomLevel] = useState(1);
  return (
    <ZoomContext.Provider value={[zoomLevel, setZoomLevel]}>
      <div className="flex">
        <div className="w-4/5 ml-20">
          <TimelineMeetingMinutes />
        </div>
        <div className="w-1/5">
          <TimelineSpeakers />
        </div>
      </div>
    </ZoomContext.Provider>
  );
}