import React, { JSX, useCallback, useMemo, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Block, BlockType, GridProps, RootLayout } from "../../types";
import { useBlockHook } from "context/BlockContext";
import styled from "styled-components";
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
  ExpandIcon,
  HeaderContainer,
  RootBlockContainer,
} from "./style";

interface BlockNodeProps {
  blockId: string;
}

const blockTypeIcons: Record<BlockType, JSX.Element | null> = {
  [BlockType.TEXT]: <SvgIcon name={CUSTOM_SVG_ICON.AddText} color="#006E75" />,
  [BlockType.IMAGE]: <SvgIcon name={CUSTOM_SVG_ICON.AddImage} color="#006E75" />,
  [BlockType.BUTTON]: <SvgIcon name={CUSTOM_SVG_ICON.AddButton} color="#006E75" />,
  [BlockType.GRID]: <SvgIcon name={CUSTOM_SVG_ICON.AddColumns} color="#006E75" />,
  [BlockType.SPACER]: <SvgIcon name={CUSTOM_SVG_ICON.AddSpacer} color="#006E75" />,
  [BlockType.GRIDCELL]: null,
  [BlockType.DIVIDER]: <SvgIcon name={CUSTOM_SVG_ICON.AddLine} />,
  [BlockType.EMPTY]: <SvgIcon name={CUSTOM_SVG_ICON.Plus} />,
};

const BlockNode = React.memo(({ blockId }: BlockNodeProps) => {
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

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "TREE_BLOCK",
    item: { id: block?.id },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    canDrag: isEnableDrop,
  }), [block, isEnableDrop]);

  const [, drop] = useDrop(() => ({
    accept: "TREE_BLOCK",
    canDrop: (item, monitor) => monitor.isOver({ shallow: true }),
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: isEnableDrop || monitor.canDrop(),
    }),
    drop: (item: { id: string }) => handleDropper(item, block.id),
  }), [block, isEnableDrop]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBlock(block);
    setIsExpanded((prev) => !prev);
  }, [block, setSelectedBlock]);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    if (block.type === BlockType.EMPTY) {
      alert("Empty blocks cannot be dragged.");
      e.preventDefault();
    }
  }, [block]);

  const renderChildNodes = useCallback((gridChildId: string, index: number) => (
    <BlockNode key={gridChildId} blockId={gridChildId} />
  ), []);

  return (
    <BlockContainer
      ref={(node) => {
        if (node) drag(drop(node));
      }}
      isDragging={isDragging}
      cursor={block?.type === BlockType.EMPTY ? "not-allowed" : "move"}
      onDragStart={handleDragStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <BlockContent hasChildBlocks={hasChildBlocks} onClick={handleClick}>
        {hasChildBlocks && (
          <ChevronIcon isExpanded={isExpanded} >
            <SvgIcon name={CUSTOM_SVG_ICON.ExpandIcon} />
          </ChevronIcon>
        )}
        <BlockContentText>
          <BlockTextIcon>
            <BlockText>{blockTypeIcons[block?.type]}</BlockText>
            <div style={{ fontSize: "12px", lineHeight: "13.4px" }}>
              {block?.type}
            </div>
          </BlockTextIcon>
          {isHovered && <SvgIcon name={CUSTOM_SVG_ICON.DragIcon} />}
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

  const handleDrop = useCallback((item: any) => {
    handleDropper(item, id);
  }, [handleDropper, id]);

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
  const { rootBlockOrder, handleDropper, setSelectedBlock, globalStyles } = useBlockHook();
  const [isRootExpanded, setIsRootExpanded] = useState(true);

  const renderBlockNode = useCallback((blockId: string) => (
    <BlockNode key={blockId} blockId={blockId} />
  ), []);

  const handleDrop = useCallback((item: any) => {
    handleDropper(item, undefined!);
  }, [handleDropper]);

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

  const toggleRootExpansion = useCallback(() => {
    setIsRootExpanded((prev) => !prev);
  }, []);

  return (
    <DroppableContainer
      accept="TREE_BLOCK"
      onDrop={handleDrop}
    >
      <HeaderContainer>Layers</HeaderContainer>
      <RootBlockContainer isExpanded={isRootExpanded} onClick={handleRootClick}>
        <ChevronIcon isExpanded={isRootExpanded} onClick={toggleRootExpansion}>
          <SvgIcon name={CUSTOM_SVG_ICON.ExpandIcon} />
          <BlockContentText>Root Block</BlockContentText>
        </ChevronIcon>
      </RootBlockContainer>
      {isRootExpanded &&
        rootBlockOrder.map(renderBlockNode)}
    </DroppableContainer>
  );
};

export default NodeTree;
