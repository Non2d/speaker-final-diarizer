import React from 'react';
import speechIdToPositionName, { isGovernment } from '../utils/speechIdToPositionName';

interface NodeAsrProps {
  data: {
    start: number;
    end: number;
    text: string;
    positionId: number;
  };
}

const NodeAsr = ({ data }: NodeAsrProps) => {
  const { text, start, end, positionId } = data;
  const zoomLevel = 10; // 1秒あたりの縦幅
  const width = 1000;
  const height = zoomLevel * (end - start);

  const isGov = isGovernment(speechIdToPositionName[positionId]);
  const positionLabelColor = isGov ? 'text-red-400' : 'text-blue-400';

  return (
    <div
      className="border border-gray-500 rounded flex items-center"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: "white",
      }}
    >
      <div
        className="w-full"
        style={{
          color: "black", // 文字色を設定
          paddingLeft: '4px', // 左側にパディングを追加
          fontWeight: 'bold', // フォントウェイトを太くする
        }}
      >
        <span
          className={`absolute top-0 right-0 px-1 ${positionLabelColor}`}
          style={{
            fontSize: '20px', // テキストサイズを小さくする
            transform: 'translateY(-25%)', // 上に移動させる
            zIndex: 0, // Z方向の重ね順で一番後ろに配置
          }}
        >
          {speechIdToPositionName[positionId]}
        </span>
        <span
          style={{
            fontSize: '14px',
            position: 'relative', // positionを追加
            zIndex: 100,
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};

export default NodeAsr;