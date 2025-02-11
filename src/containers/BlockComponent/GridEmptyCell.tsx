import Droppable from "../Droppable";
import { useCallback } from "react";

const GridEmptyCell: React.FC<any> = ({
  handleDropper,
}: {
  handleDropper: (item: any) => void;
}) => {
  const handleDrop = useCallback(
    (item: { type: string; name: string; id: number }) => {
      handleDropper(item);
    },
    [handleDropper]
  );

  return (
    <Droppable
      accept="BLOCK"
      onDrop={handleDrop}
      style={{ height: "100%", padding: "10px", backgroundColor: "#f0f8ff" }}
      onClick={() => {}}
    >
      Drop Here
    </Droppable>
  );
};

export default GridEmptyCell;
