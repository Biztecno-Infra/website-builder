import React, { JSX, useCallback, useMemo, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Block, GridProps, RootLayout } from "../../types";
import { useBlockHook } from "context/BlockContext";
import styled, { useTheme } from "styled-components";
import Droppable from "@containers/Droppable";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import {
  BlockContainer,
  BlockContent,
  BlockContentText,
  BlockText,
  BlockTextIcon,
  ChevronIcon,
  ChildNodesContainer,
  EmptyTreeNodeContainer,
  HeaderContainer,
  RootBlockContainer,
} from "./style";
import { BlockType, SizeEnum } from "enum";

interface BlockNodeProps {
  blockId: string;
}

const getBlockTypeIcons = (color: string): Record<BlockType, JSX.Element | null> => ({
  [BlockType.TEXT]: <SvgIcon name={CUSTOM_SVG_ICON.AddText} color={color} />,
  [BlockType.IMAGE]: <SvgIcon name={CUSTOM_SVG_ICON.AddImage} color={color} />,
  [BlockType.BUTTON]: <SvgIcon name={CUSTOM_SVG_ICON.AddButton} color={color} />,
  [BlockType.GRID]: <SvgIcon name={CUSTOM_SVG_ICON.AddColumns} color={color} />,
  [BlockType.SPACER]: <SvgIcon name={CUSTOM_SVG_ICON.AddSpacer} color={color} />,
  [BlockType.GRIDCELL]: null,
  [BlockType.DIVIDER]: <SvgIcon name={CUSTOM_SVG_ICON.AddLine} />,
  [BlockType.EMPTY]: <SvgIcon name={CUSTOM_SVG_ICON.Plus} />,
});
const BlockNode = React.memo(({ blockId }: BlockNodeProps) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { blocks, handleDropper, setSelectedBlock } = useBlockHook();

  const block = blocks[blockId];

  const { hasChildBlocks, isEnableDrop } = useMemo(() => {
    if (block) {
      return {
        hasChildBlocks:
          block.type === BlockType.GRID || block.type === BlockType.GRIDCELL,
        isEnableDrop: block.type !== BlockType.EMPTY,
      };
    }
    return { hasChildBlocks: false, isEnableDrop: false };
  }, [block]);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "TREE_BLOCK",
      item: { id: block?.id },
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
      canDrag: isEnableDrop,
    }),
    [block, isEnableDrop]
  );

  const [, drop] = useDrop(
    () => ({
      accept: "TREE_BLOCK",
      canDrop: (item, monitor) => monitor.isOver({ shallow: true }),
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: isEnableDrop || monitor.canDrop(),
      }),
      drop: (item: { id: string }) => handleDropper(item, block.id),
    }),
    [block, isEnableDrop]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedBlock(block);
      setIsExpanded((prev) => !prev);
    },
    [block, setSelectedBlock]
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      if (block.type === BlockType.EMPTY) {
        alert("Empty blocks cannot be dragged.");
        e.preventDefault();
      }
    },
    [block]
  );

  const renderChildNodes = useCallback(
    (gridChildId: string, index: number) => (
      <BlockNode key={gridChildId} blockId={gridChildId} />
    ),
    []
  );

  const blockTypeIcons = getBlockTypeIcons(theme?.color?.buttonPrimary);

  return (
    <BlockContainer
      ref={(node) => {
        if (node) drag(drop(node));
      }}
      $isDragging={isDragging}
      cursor={block?.type === BlockType.EMPTY ? "not-allowed" : "move"}
      onDragStart={handleDragStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <BlockContent hasChildBlocks={hasChildBlocks} onClick={handleClick}>
        {hasChildBlocks && (
          <ChevronIcon isExpanded={isExpanded}>
            <SvgIcon name={CUSTOM_SVG_ICON.ExpandIcon} />
          </ChevronIcon>
        )}
        <BlockContentText>
          <BlockTextIcon style={{ width: "80%" }}>
            <BlockText style={{ width: "20%" }}>{blockTypeIcons[block?.type]}</BlockText>
            <div style={{ fontSize: "12px", width: "80%" }}>{block?.type}</div>
          </BlockTextIcon>
          {isHovered && <SvgIcon name={CUSTOM_SVG_ICON.DragIcon} svgStyle={{ width: "20%" }} />}
        </BlockContentText>
      </BlockContent>

      {isExpanded && hasChildBlocks && (
        <ChildNodesContainer>
          {(block as GridProps)?.childBlocks.map(renderChildNodes)}
          {(block as GridProps)?.childBlocks.length === 0 && (
            <EmptyTreeNode id={block.id} />
          )}
        </ChildNodesContainer>
      )}
    </BlockContainer>
  );
});

const EmptyTreeNode = ({ id }: { id: string }) => {
  const { handleDropper } = useBlockHook();

  const handleDrop = useCallback(
    (item: any) => {
      handleDropper(item, id);
    },
    [handleDropper, id]
  );

  return (
    <EmptyTreeNodeContainer onDrop={handleDrop}>
      DROP Nodes
    </EmptyTreeNodeContainer>
  );
};

const DroppableContainer = styled(Droppable)`
  height: 100%;
  width: calc(100% - 4rem);
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const NodeTree = () => {
  const { rootBlockOrder, handleDropper, setSelectedBlock, globalStyles } =
    useBlockHook();

  const renderBlockNode = useCallback(
    (blockId: string) => <BlockNode key={blockId} blockId={blockId} />,
    []
  );

  const handleDrop = useCallback(
    (item: any) => {
      handleDropper(item, undefined!);
    },
    [handleDropper]
  );

  const handleRootClick = useCallback(() => {
    const rootBlock: RootLayout = {
      type: "EmailLayout",
      data: {
        style: {
          canvasColor: globalStyles?.canvasColor,
          textColor: globalStyles?.textColor,
          fontFamily: globalStyles?.fontFamily,
        },
        childrenIds: rootBlockOrder,
      },
    };
    setSelectedBlock(rootBlock);
  }, [rootBlockOrder, globalStyles, setSelectedBlock]);

  return (
    <DroppableContainer accept="TREE_BLOCK" onDrop={handleDrop}>
      <HeaderContainer>Layers</HeaderContainer>
      <RootBlockContainer onClick={handleRootClick}>
        <SvgIcon name={CUSTOM_SVG_ICON.GlobalSettings} size={SizeEnum.Small} svgStyle={{ width: "20%" }} />
        <BlockContentText style={{ width: "80%" , cursor: "pointer" }}>Global Settings</BlockContentText>
      </RootBlockContainer>
      {rootBlockOrder.map(renderBlockNode)}
    </DroppableContainer>
  );
};

export default NodeTree;
