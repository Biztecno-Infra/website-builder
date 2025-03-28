import React, { useState } from "react";
import { useDrag } from "react-dnd";
import styled, { useTheme } from "styled-components";
import { BlockType } from "email-builder-utils";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { SizeEnum } from "enum";
import { Theme } from "types";

export interface IElements {
  type: string;
  name: string;
  elements: any;
  svgProps: {
    name: CUSTOM_SVG_ICON;
    color?: string;
    size?: SizeEnum;
    bgColor?: string;
  };
  icon: any;
}

const BlockItemContainer = styled.div<{ $isDragging: boolean, $elements: any, $isHovered: boolean, $colors: any }>`
  opacity: ${({ $isDragging }) => ($isDragging ? 0.5 : 1)};
  margin-bottom: ${({ $elements }) => $elements.marginBottom};
  cursor: ${({ $elements }) => $elements.cursor};
  border-radius: ${({ $elements }) => $elements.borderRadius};
  border: ${({ $elements }) => $elements.border};
  width: ${({ $elements }) => $elements.width};
  padding: ${({ $elements }) => $elements.padding};
  text-align: ${({ $elements }) => $elements.textAlign};
  background-color: ${({ $isDragging, $isHovered, $colors }) =>
    $isDragging ? 'transparent' : ($isHovered ? $colors.buttonPrimary : $colors.secondary)};
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const BlockName = styled.div<{ $isHovered: boolean, $colors: any }>`
  font-size: 11px;
  padding-left: 1rem;
  color: ${({ $isHovered, $colors }) => $isHovered ? $colors.secondary : $colors.buttonPrimary};
  transition: color 0.3s ease;
`;

const BlockIconText = styled.div`
   display: flex;
  align-Items: center;
  justify-Content: center;
`;

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-right: 0.75rem;
`;

const BlockItem: React.FC<IElements> = ({ type, name, elements, icon, svgProps }) => {
  const [isHovered, setIsHovered] = useState(false);
  const theme = useTheme();
  const { colors } = theme as Theme || {};

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
      $isDragging={isDragging}
      $elements={elements}
      $isHovered={isHovered}
      $colors={colors}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        borderRadius: elements.borderRadius,
        border: isDragging ? 'none' : elements.border, // Remove border during drag
      }}
    >
      <BlockIconText>
        <SvgIcon {...svgProps} color={isHovered ? colors.secondary : colors.primary} />
        <BlockName $isHovered={isHovered} $colors={colors}>{name}</BlockName>
      </BlockIconText>
      {isHovered && <IconContainer>{icon(isHovered, colors)}</IconContainer>}
    </BlockItemContainer>
  );
};
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  /* background-color: #fff; */
  position: relative;
  z-index: 998;
  width: calc(100% - 4rem);
  height: 100%;
`;

const Header = styled.div`
  font-size: ${({ theme }) => theme.fontSize.labelHeader};
  border-bottom: 1px solid #dddddd;
  height: 3rem;
  width: 100%;
  margin-bottom: 0.75rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  padding-left: 0.5rem;
`;

const Sections: React.FC = () => {
  const theme = useTheme();
  const { colors, fontSize, elementsPanel } = theme as Theme || {};

  const blockItems = [
    {
      type: BlockType.TEXT,
      name: "Add Text",
      svgProps: { name: CUSTOM_SVG_ICON.AddText, color: colors.primary, size: SizeEnum.Medium, circular: true },
      icon: (isHovered: any, colors: any) => <SvgIcon name={CUSTOM_SVG_ICON.DragIcon} color={isHovered ? colors.secondary : colors.primary} />
    },
    {
      type: BlockType.IMAGE,
      name: "Add Image",
      svgProps: { name: CUSTOM_SVG_ICON.AddImage, color: colors.primary, size: SizeEnum.Medium, circular: true },
      icon: (isHovered: any, colors: any) => <SvgIcon name={CUSTOM_SVG_ICON.DragIcon} color={isHovered ? colors.secondary : colors.primary} />
    },
    {
      type: BlockType.BUTTON,
      name: "Add Button",
      svgProps: { name: CUSTOM_SVG_ICON.AddButton, color: colors.primary, size: SizeEnum.Medium, circular: true },
      icon: (isHovered: any, colors: any) => <SvgIcon name={CUSTOM_SVG_ICON.DragIcon} color={isHovered ? colors.secondary : colors.primary} />
    },
    {
      type: BlockType.GRID,
      name: "Add Columns",
      svgProps: { name: CUSTOM_SVG_ICON.AddColumns, color: colors.primary, size: SizeEnum.Medium, circular: true },
      icon: (isHovered: any, colors: any) => <SvgIcon name={CUSTOM_SVG_ICON.DragIcon} color={isHovered ? colors.secondary : colors.primary} />
    },
    {
      type: BlockType.DIVIDER,
      name: "Add Divider",
      svgProps: { name: CUSTOM_SVG_ICON.AddLine, color: colors.primary, size: SizeEnum.Medium, circular: true },
      icon: (isHovered: any, colors: any) => <SvgIcon name={CUSTOM_SVG_ICON.DragIcon} color={isHovered ? colors.secondary : colors.primary} />
    },
    {
      type: BlockType.SPACER,
      name: "Add Spacer",
      svgProps: { name: CUSTOM_SVG_ICON.AddSpacer, color: colors.primary, size: SizeEnum.Medium, circular: true },
      icon: (isHovered: any, colors: any) => <SvgIcon name={CUSTOM_SVG_ICON.DragIcon} color={isHovered ? colors.secondary : colors.primary} />
    },
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