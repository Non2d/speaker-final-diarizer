import React from 'react';
import diarizationColors from '../utils/DiarizationColors';

interface NodeAsrProps {
  data: {
    text: string;
    start: number;
    end: number;
    speaker: number;
    borderWidth: number; // 枠の太さを指定
    borderColor: string; // 枠の色を指定
  };
}

const NodeAsr = ({ data }: NodeAsrProps) => {
  const { text, start, end, speaker} = data;
  
  const threshold = 20; // heightが20未満の場合に色を変える閾値
  const zoomLevel = 10; // 1秒あたりの高さ
  const width = 1000;
  const height = zoomLevel * (end - start);

  const borderWidth = 2;
  const textColor = height < threshold ? '#fff' : '#000'; // heightが20未満の場合は文字を白くする
  const textShadowColor = height < threshold ? '#000' : '#fff'; // heightが20未満の場合は影を白くする
  const backgroundColor = height < threshold ? '#000' : '#fff'; // heightが20未満の場合は背景を黒くする
  const textShadow = `1px 1px 0 ${textShadowColor}, -1px -1px 0 ${textShadowColor}, 1px -1px 0 ${textShadowColor}, -1px 1px 0 ${textShadowColor}`;

  return (
    <div
      className="border border-black rounded flex items-center"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderWidth: `${borderWidth}px ${10}px ${borderWidth}px ${borderWidth}px`, // 右辺のボーダー幅を個別に設定
        backgroundColor: backgroundColor,
        borderColor: `black ${diarizationColors[speaker]} black black`,
        // overflow: 'auto' // スクロールを有効にする
      }}
    >
      <div
        className="text-sm w-full"
        style={{
          color: textColor, // 文字色を設定
          textShadow: textShadow, // 影を設定
          fontWeight: 'bold', // 文字の太さを設定
          paddingLeft: '4px', // 左側にパディングを追加
        }}
      >
        {text}
      </div>
    </div>
  );
};

export default NodeAsr;