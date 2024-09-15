interface NodeTimeLabelProps {
  data: {
    seconds: number;
  };
}

const NodeTimeLabel: React.FC<NodeTimeLabelProps> = ({ data }) => {
  const hours = Math.floor(data.seconds / 3600);
  const minutes = Math.floor((data.seconds % 3600) / 60);
  const seconds = data.seconds % 60;
  const formattedTime = `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div style={{ backgroundColor: 'white' }}>
      {formattedTime}
    </div>
  );
};

export default NodeTimeLabel;