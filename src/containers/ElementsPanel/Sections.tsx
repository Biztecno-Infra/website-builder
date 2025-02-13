import { BlockType, Theme } from "../../types";
import React from "react";
import { useDrag } from "react-dnd";
import styled, { useTheme } from "styled-components";

export interface IElements {
  type: string;
  name: string;
  elements: any;
}

export const BlockItem = ({ type, name, elements }: IElements,) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "BLOCK",
    item: { type, name },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));
  return (
    <div
      ref={drag as any}
      style={{
        opacity: isDragging ? 0.5 : 1,
        padding: elements.padding,
        border: elements.border,
        marginBottom: elements.marginBottom,
        cursor: elements.cursor,
        width: elements.width,
        textAlign: elements.textAlign,
        backgroundColor: isDragging ? "#f0f0f0" : elements.background ? elements.background : "#fff",
      }}
    >
      {name}
    </div>
  );
};



const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: #fff;
  position: relative;
  z-index: 1000;
  padding-top: 20px;
`;

const Sections: React.FC = () => {

  const theme = useTheme();
  const blockItems = [
    { type: BlockType.TEXT, name: "Text" },
    { type: BlockType.IMAGE, name: "Image" },
    { type: BlockType.BUTTON, name: "Button" },
    { type: BlockType.GRID, name: "Grid" },
    { type: BlockType.DIVIDER, name: "Divider" },
    { type: BlockType.SPACER, name: "Spacer" },
  ];



  return (
    <Container>
      <h3>Blocks</h3>
      {blockItems.map((block, index) => (
        <BlockItem key={index} type={block.type} name={block.name} elements={theme.elementsPanel} />
      ))}
    </Container>
  );
};

export default Sections;
