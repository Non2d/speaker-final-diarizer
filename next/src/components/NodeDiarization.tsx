import diarizationColors from '../utils/DiarizationColors';

interface NodeTimeLabelProps {
    data: {
        label: number;
        width: number;
        height: number;
    };
}

const NodeDiarization: React.FC<NodeTimeLabelProps> = ({ data }) => {
    if(data.label>20){
        console.error("Too many speakers! Color is lacking.")
    }
    return (
        <div
          className="border border-black flex items-center justify-center"
          style={{ width: `${data.width}px`, height: `${data.height}px`, borderWidth: `0px`, backgroundColor: diarizationColors[data.label%20]}}
        >
        </div>
      );
};

export default NodeDiarization;