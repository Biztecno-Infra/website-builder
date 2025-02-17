import React from "react";
import { useDrag } from "react-dnd";
import styled, { useTheme } from "styled-components";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { SizeEnum } from "@components/SvgIcon/SvgIcon";
import { BlockType, Theme } from "types";

export interface IElements {
  type: string;
  name: string;
  elements: any;
  svgProps: {
    name: CUSTOM_SVG_ICON;
    color: string;
    size: SizeEnum;
    bgColor: string;
  };
  icon: any;
}

const BlockItemContainer = styled.div<{ isDragging: boolean, elements: any }>`
  opacity: ${({ isDragging }) => (isDragging ? 0.5 : 1)};
  padding: ${({ elements }) => elements.padding};
  border: ${({ elements }) => elements.border};
  margin-bottom: ${({ elements }) => elements.marginBottom};
  border-radius: ${({ elements }) => elements.borderRadius};
  cursor: ${({ elements }) => elements.cursor};
  width: ${({ elements }) => elements.width};
  text-align: ${({ elements }) => elements.textAlign};
  background-color: ${({ isDragging, elements }) => isDragging ? "#f0f0f0" : (elements.background ? elements.background : "#fff")};
  display: flex;
  justify-content: space-around;
  align-items: center;
`;

const BlockName = styled.div`
  font-size: 11px;
  color: #0b978e;
`;

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const BlockItem: React.FC<IElements> = ({ type, name, elements, icon, svgProps }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "BLOCK",
    item: { type, name },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <BlockItemContainer
      ref={drag as any}
      isDragging={isDragging}
      elements={elements}
    >
      <SvgIcon {...svgProps} />
      <BlockName>{name}</BlockName>
      <IconContainer>{icon}</IconContainer>
    </BlockItemContainer>
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
  height: 100%;
`;

const Header = styled.div`
  font-size: ${({ theme }) => theme.fontSize.labelHeader};
  border-bottom: 1px solid #dddddd;
  padding: 0.7rem;
  width: 91%;
  margin-bottom: 2rem;
  font-weight: 500;
`;

const Sections: React.FC = () => {
  const theme = useTheme();
  const { colors, fontSize, elementsPanel } = theme as Theme || {};

  const blockItems = [
    { type: BlockType.TEXT, name: "Add Text", svgProps: { name: CUSTOM_SVG_ICON.AddText, color: colors.secondary, size: SizeEnum.Medium, bgColor: colors.primary, circular: true }, icon: <SvgIcon name={CUSTOM_SVG_ICON.DragIcon} /> },
    { type: BlockType.IMAGE, name: "Add Image", svgProps: { name: CUSTOM_SVG_ICON.AddImage, color: colors.secondary, size: SizeEnum.Medium, bgColor: colors.primary, circular: true }, icon: <SvgIcon name={CUSTOM_SVG_ICON.DragIcon} /> },
    { type: BlockType.BUTTON, name: "Add Button", svgProps: { name: CUSTOM_SVG_ICON.AddButton, color: colors.secondary, size: SizeEnum.Medium, bgColor: colors.primary, circular: true }, icon: <SvgIcon name={CUSTOM_SVG_ICON.DragIcon} /> },
    { type: BlockType.GRID, name: "Add Columns", svgProps: { name: CUSTOM_SVG_ICON.AddColumns, color: colors.secondary, size: SizeEnum.Medium, bgColor: colors.primary, circular: true }, icon: <SvgIcon name={CUSTOM_SVG_ICON.DragIcon} /> },
    { type: BlockType.DIVIDER, name: "Add Divider", svgProps: { name: CUSTOM_SVG_ICON.AddLine, color: colors.secondary, size: SizeEnum.Medium, bgColor: colors.primary, circular: true }, icon: <SvgIcon name={CUSTOM_SVG_ICON.DragIcon} /> },
    { type: BlockType.SPACER, name: "Add Spacer", svgProps: { name: CUSTOM_SVG_ICON.AddSpacer, color: colors.secondary, size: SizeEnum.Medium, bgColor: colors.primary, circular: true }, icon: <SvgIcon name={CUSTOM_SVG_ICON.DragIcon} /> },
  ];

  return (
    <Container>
      <Header>Create</Header>
      {blockItems.map((block, index) => (
        <BlockItem
          key={index}
          type={block.type}
          name={block.name}
          elements={elementsPanel}
          svgProps={block.svgProps}
          icon={block.icon}
        />
      ))}
    </Container>
  );
};

export default Sections;
