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
      style={{
        height: "100%",
        padding: "10px",
        // backgroundColor: "#F5F5F5",
        color: "#8D8D8D",
      }}
      backgroundColor="#F5F5F5"
      onClick={() => {}}
    >
      Drag & drop an element here to add.
    </Droppable>
  );
};

export default GridEmptyCell;
