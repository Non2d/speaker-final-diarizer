import React from 'react';

interface NodeAsrProps {
  data: {
    label: string;
    height: number;
    width: number;
    borderWidth: number; // 枠の太さを指定
    borderColor: string; // 枠の色を指定
    start: number;
  };
}

const NodeAsr = ({ data }: NodeAsrProps) => {
  const { label, height, width, borderWidth, borderColor, start } = data;
  const threshold = 20; // heightが20未満の場合に色を変える閾値
  const textColor = height < threshold ? '#fff' : '#000'; // heightが20未満の場合は文字を白くする
  const textShadowColor = height < threshold ? '#000' : '#fff'; // heightが20未満の場合は影を白くする
  const backgroundColor = height < threshold ? '#000' : '#fff'; // heightが20未満の場合は背景を黒くする
  const textShadow = `1px 1px 0 ${textShadowColor}, -1px -1px 0 ${textShadowColor}, 1px -1px 0 ${textShadowColor}, -1px 1px 0 ${textShadowColor}`;

  // グローバル変数としてポップアップウィンドウの参照を保持
  let popup: Window | null = null;

  const onNodeClick = () => {
    const youtubeUrl = `https://www.youtube.com/watch?v=tuxREnaOR5M&t=${Math.floor(start)}s`;
    if (popup && !popup.closed) {
      popup.location.href = youtubeUrl;
      popup.focus();
    } else {
      popup = window.open(youtubeUrl, 'youtubePopup', 'width=800,height=600,scrollbars=no,resizable=no,left=1200,top=200');
    }
  };

  return (
    <div
      className="border border-black rounded flex items-center"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderWidth: `${borderWidth}px ${10}px ${borderWidth}px ${borderWidth}px`, // 右辺のボーダー幅を個別に設定
        backgroundColor: backgroundColor,
        borderColor: `black ${borderColor} black black`,
        // overflow: 'auto' // スクロールを有効にする
      }}
      onClick={onNodeClick}
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
        {label}
      </div>
    </div>
  );
};

export default NodeAsr;