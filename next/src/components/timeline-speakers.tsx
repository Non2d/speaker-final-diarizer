import React from 'react';

const TimelineSpeakers = () => {
    // 縦棒の位置を指定
    const barPositions = {
        red: [[0, 30], [40, 57], [70, 81], [90, 105], [120, 150]],
        blue: [[0, 36], [50, 58], [70, 83], [90, 110]],
        green: [[0, 33], [45, 60], [75, 85], [95, 110], [120, 150]],
        orange: [[0, 39], [50, 66], [80, 91], [100, 115], [130, 140], [150, 150]],
        purple: [[0, 42], [43, 71], [72, 96], [97, 120]],
        pink: [[0, 45], [46, 74], [75, 99], [100, 123], [124, 150]],
        cyan: [[0, 48], [49, 77], [78, 102], [103, 126], [127, 150]],
        magenta: [[0, 51], [52, 81], [82, 106], [107, 130]],
        lime: [[0, 54], [55, 85], [86, 110], [111, 135], [136, 150], [151, 150]]
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
                                top: `${start * 10}px`, // 始点をずらす
                                width: '7px',
                                height: `${(end - start) * 10}px`, // 高さを終了位置と開始位置の差で計算
                                backgroundColor: color
                            }}
                        />
                        {index === 0 && (
                            <div
                                style={{
                                    position: 'absolute',
                                    left: `${colorIndex * 30 - 5}px`, // 横座標を調整
                                    top: `${start * 10 - 30}px`, // 数字を棒の上に表示
                                    width: '17px', // テキストの幅を広げる
                                    textAlign: 'center', // テキストをセンター揃え
                                    color: 'gray',
                                    fontSize: '25px'
                                }}
                            >
                                {colorIndex + 1}
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}

export default TimelineSpeakers;