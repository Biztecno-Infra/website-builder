import React, { useCallback, useMemo, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Block, BlockType, GridProps, RootLayout } from "../../types";
import { useBlockHook } from "context/BlockContext";
import styled, { useTheme } from "styled-components";
import Droppable from "@containers/Droppable";

interface BlockNodeProps {
  blockId: string;
}

const BlockContainer = styled.div<{ isDragging: boolean; cursor: string }>`
  opacity: ${({ isDragging }) => (isDragging ? 0.5 : 1)};
  cursor: ${({ cursor }) => cursor};
`;

const BlockContent = styled.div<{ hasChildBlocks: boolean }>`
  padding: 8px;
  cursor: ${({ hasChildBlocks }) => (hasChildBlocks ? "pointer" : "default")};
  display: flex;
  align-items: center;
`;

const ChildNodesContainer = styled.div`
  padding-left: 8px;
`;

const EmptyTreeNodeContainer = styled.div`
  padding-bottom: 50px;
  padding-left: 16px;
  background-color: #f4f4f4;
  border: 1px dashed #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
  cursor: pointer;
`;

const BlockNode = ({ blockId }: BlockNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { blocks, handleDropper, setSelectedBlock } = useBlockHook();

  const block: Block = useMemo(() => blocks[blockId], [blocks[blockId]]);

  const {
    hasChildBlocks,
    isEnableDrop,
  }: { hasChildBlocks: boolean; isEnableDrop: boolean } = useMemo(() => {
    if (block) {
      return {
        hasChildBlocks:
          block.type === BlockType.GRID || block.type === BlockType.GRIDCELL,
        isEnableDrop: block.type !== BlockType.EMPTY,
      };
    } else {
      return {
        hasChildBlocks: false,
        isEnableDrop: false,
      };
    }
  }, [block]);

  const toggleExpansion = useCallback((e: any) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  }, []);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "TREE_BLOCK",
    item: { id: block?.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: isEnableDrop,
  }));

  const [, drop] = useDrop(() => ({
    accept: "TREE_BLOCK",
    canDrop: (item, monitor) => monitor.isOver({ shallow: true }),
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: isEnableDrop || monitor.canDrop(),
    }),
    drop: (item: { id: string }) => handleDropper(item, block.id),
  }));

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBlock(block);
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (block.type === BlockType.EMPTY) {
      alert("Empty blocks cannot be dragged.");
      e.preventDefault();
    }
  };

  const renderChildNodes = (gridChildId: string, index: number) => {
    return <BlockNode key={gridChildId} blockId={gridChildId} />;
  };

  const ChevronIcon = ({
    isExpanded,
    onClick,
  }: {
    isExpanded: boolean;
    onClick: any;
  }) => (
    <span
      style={{ marginRight: "10px", cursor: "pointer", fontSize: "16px" }}
      onClick={onClick}
    >
      {isExpanded ? "▼" : "►"}
    </span>
  );

  return (
    <BlockContainer
      ref={(node) => {
        if (node) drag(drop(node));
      }}
      isDragging={isDragging}
      cursor={block?.type === BlockType.EMPTY ? "not-allowed" : "move"}
      onDragStart={handleDragStart}
    >
      <BlockContent hasChildBlocks={hasChildBlocks} onClick={handleClick}>
        {hasChildBlocks && (
          <ChevronIcon isExpanded={isExpanded} onClick={toggleExpansion} />
        )}
        {block?.type} ({block?.id.substring(16)})
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
};

const EmptyTreeNode = ({ id }: { id: string }) => {
  const { handleDropper } = useBlockHook();

  const handleDrop = (item: any) => {
    handleDropper(item, id); // TODO: Need to modify the dropper logic to handle the correct drop action
  };

  return (
    <EmptyTreeNodeContainer onDrop={handleDrop}>
      DROP Nodes
    </EmptyTreeNodeContainer>
  );
};

const DroppableContainer = styled(Droppable)`
  min-height: 100%;
  width: 100%;
  /* padding: 0.5rem; */
  padding-bottom: 200px;
`;

const RootBlockContainer = styled.div`
  cursor: pointer;
  /* padding: 10px; */
  background: #f0f0f0;
`;

const NodeTree = () => {
  const { rootBlockOrder, handleDropper, setSelectedBlock, globalStyles } = useBlockHook();
  const theme = useTheme();

  const renderBlockNode = (blockId: string) => {
    return <BlockNode key={blockId} blockId={blockId} />;
  };

  const handleDrop = (item: any) => {
    handleDropper(item, undefined!);
  };

  const handleRootClick = () => {
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
    }
    setSelectedBlock(rootBlock);
  };

  return (
    <DroppableContainer
      accept="TREE_BLOCK"
      onDrop={handleDrop}
      onClick={() => { }}
    >
      <div style={{ fontSize: theme.fontSize.labelHeader, borderBottom: '1px solid #DDDDDD', padding: "0.7rem", width: "91%", fontWeight: "500" }}>Layers</div>
      <RootBlockContainer onClick={handleRootClick}>
        Root Block
      </RootBlockContainer>
      {rootBlockOrder.map(renderBlockNode)}
    </DroppableContainer>
  );
};

export default NodeTree;
