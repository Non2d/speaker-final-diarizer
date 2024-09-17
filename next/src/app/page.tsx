"use client";
import Timeline from "../components/Timeline";
import { Toaster } from 'react-hot-toast';

export default function Home() {
  return (
    <>
      <Timeline />
      <Toaster />
    </>
  );
}