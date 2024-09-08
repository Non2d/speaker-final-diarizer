"use client";

import TimelineMeetingMinutes from '../components/timeline-meeting-minutes';
import TimelineSpeakers from '../components/timeline-speakers';

export default function Home() {
  return (
    <div className="flex">
      <div className="w-2/3">
        <TimelineMeetingMinutes />
      </div>
      <div className="w-1/3">
        <TimelineSpeakers />
      </div>
    </div>
  );
}