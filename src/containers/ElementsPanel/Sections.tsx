import { BlockType } from "../../types";
import React from "react";
import { useDrag } from "react-dnd";
import { useTheme } from "styled-components";

export interface IElements {
  type: string;
  name: string;
}

export const BlockItem = ({ type, name }: IElements) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "BLOCK", 
    item: { type, name }, 
    collect: (monitor) => ({
      isDragging: monitor.isDragging(), 
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        padding: "10px",
        border: "1px solid #ccc",
        marginBottom: "10px",
        cursor: "pointer",
        width: "90%",
        textAlign:"center",
        backgroundColor: isDragging ? "#f0f0f0" : "#fff", // Lighten background when dragging
      }}
    >
     {name}
    </div>
  );
};

const Sections: React.FC = () => {
  const theme = useTheme();
  console.log(theme , "styled")
  const blockItems = [
    { type: BlockType.TEXT, name: "Text" },
    { type: BlockType.IMAGE, name: "Image" },
    { type: BlockType.BUTTON, name: "Button" },
    { type: BlockType.GRID, name: "Grid" },
    { type: BlockType.DIVIDER, name: "Divider" },
    { type: BlockType.SPACER, name: "Spacer" },
  ];

  return (
    <div
      className="width-100 flex flex-column padding-2 flex-align-center"
      style={{
        // boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.1)", 
        backgroundColor: "#fff", 
        position: "relative",
        zIndex: "1000", 
        paddingTop: "20px", 
      }}
    >
      <h3>Blocks</h3>
      {blockItems.map((block, index) => (
          <BlockItem key={index} type={block.type} name={block.name} />
        ))}
    </div>
  );
};

export default Sections;
