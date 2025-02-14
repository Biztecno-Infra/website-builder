import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { BlockType, Theme } from "../../types";
import React from "react";
import { useDrag } from "react-dnd";
import styled, { useTheme } from "styled-components";

export interface IElements {
  type: string;
  name: string;
  elements: any;
  svg: any;
  icon: any
}

export const BlockItem = ({ type, name, elements, svg, icon }: IElements,) => {
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
        borderRadius: elements.borderRadius,
        cursor: elements.cursor,
        width: elements.width,
        textAlign: elements.textAlign,
        backgroundColor: isDragging ? "#f0f0f0" : elements.background ? elements.background : "#fff",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center"
      }}
    >
      <div style={{ background: "#0B978E", height: "28px", width: '28px', borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>{svg}</div>
      <div style={{ fontSize: "11px", color: "#0B978E" }}>{name}</div>
      <div>{icon}</div>
    </div>
  );
};



const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fff;
  position: relative;
  z-index: 1000;
  width: 100%;
`;

const Sections: React.FC = () => {

  const theme = useTheme();
  const blockItems = [
    { type: BlockType.TEXT, name: "Add Text", svg: <SvgIcon name={CUSTOM_SVG_ICON.AddText} />, icon: <SvgIcon name={CUSTOM_SVG_ICON.DragIcon} /> },
    { type: BlockType.IMAGE, name: "Add Image", svg: <SvgIcon name={CUSTOM_SVG_ICON.AddImage} />, icon: <SvgIcon name={CUSTOM_SVG_ICON.DragIcon} /> },
    { type: BlockType.BUTTON, name: "Add Button", svg: <SvgIcon name={CUSTOM_SVG_ICON.AddButton} />, icon: <SvgIcon name={CUSTOM_SVG_ICON.DragIcon} /> },
    { type: BlockType.GRID, name: "Add Columns", svg: <SvgIcon name={CUSTOM_SVG_ICON.AddColumns} />, icon: <SvgIcon name={CUSTOM_SVG_ICON.DragIcon} /> },
    { type: BlockType.DIVIDER, name: "Add Divider", svg: <div style={{ width: "70%", padding: "1px", background: "white" }} />, icon: <SvgIcon name={CUSTOM_SVG_ICON.DragIcon} /> },
    { type: BlockType.SPACER, name: "Add Spacer", svg: <div style={{ width: "60%", padding: "3px", background: "white" }} />, icon: <SvgIcon name={CUSTOM_SVG_ICON.DragIcon} /> },
  ];



  return (
    <Container>
      <div style={{ fontSize: theme.fontSize.labelHeader, borderBottom: '1px solid #DDDDDD', padding: "0.7rem", width: "91%", marginBottom: "2rem", fontWeight: "500" }}>Create</div>
      {blockItems.map((block, index) => (
        <BlockItem key={index} type={block.type} name={block.name} elements={theme.elementsPanel} svg={block.svg} icon={block.icon} />
      ))}
    </Container>
  );
};

export default Sections;
