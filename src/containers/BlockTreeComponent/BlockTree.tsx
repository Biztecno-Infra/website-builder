import React, { useCallback, useMemo, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Block, BlockType, GridProps, RootLayout } from "../../types";
import { useBlockHook } from "context/BlockContext";
import styled, { useTheme } from "styled-components";
import Droppable from "@containers/Droppable";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";

interface BlockNodeProps {
  blockId: string;
}
const blockTypeIcons: Record<BlockType, any> = {
  [BlockType.TEXT]: <SvgIcon name={CUSTOM_SVG_ICON.AddText} color="#006E75" />,
  [BlockType.IMAGE]: <SvgIcon name={CUSTOM_SVG_ICON.AddImage} color="#006E75" />,
  [BlockType.BUTTON]: <SvgIcon name={CUSTOM_SVG_ICON.AddButton} color="#006E75" />,
  [BlockType.GRID]: <SvgIcon name={CUSTOM_SVG_ICON.AddColumns} color="#006E75" />,
  [BlockType.SPACER]: <SvgIcon name={CUSTOM_SVG_ICON.AddSpacer} color="#006E75" />,
  [BlockType.GRIDCELL]: null,
  [BlockType.DIVIDER]: <SvgIcon name={CUSTOM_SVG_ICON.AddLine} />,
  [BlockType.EMPTY]: <SvgIcon name={CUSTOM_SVG_ICON.Plus} />,
};
const BlockContainer = styled.div<{ isDragging: boolean; cursor: string }>`
  opacity: ${({ isDragging }) => (isDragging ? 0.5 : 1)};
  cursor: ${({ cursor }) => cursor};
`;

const BlockContent = styled.div<{ hasChildBlocks: boolean }>`
  cursor: ${({ hasChildBlocks }) => (hasChildBlocks ? "pointer" : "default")};
  display: flex;
  align-items: center;
`;

const ChildNodesContainer = styled.div`
  padding-left: 8px;
`;

const BlockContentText = styled.div`
display: flex;
flex-direction: row;
align-items: center;
justify-content: space-between;
color:#006E75 ;
width: 100%;
&:hover {
    background-color: #F5F5F5;
  }
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

const ExpandIcon = styled.div`
    transform: rotate(270deg);
`;
const ChevronIcon = styled.span<{ isExpanded: boolean }>`
  margin-right: 10px;
  cursor: pointer;
  font-size: 16px;
`;

const BlockNode = ({ blockId }: BlockNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { blocks, handleDropper, setSelectedBlock } = useBlockHook();

  const block: Block = useMemo(() => blocks[blockId], [blocks[blockId]]);

  const { hasChildBlocks, isEnableDrop } = useMemo(() => {
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
          <ChevronIcon isExpanded={isExpanded} onClick={toggleExpansion}>
            {isExpanded ? <SvgIcon name={CUSTOM_SVG_ICON.ExpandIcon} /> : <ExpandIcon><SvgIcon name={CUSTOM_SVG_ICON.ExpandIcon} /></ExpandIcon>}
          </ChevronIcon>
        )}
        <BlockContentText>
          <div style={{ display: "flex", alignItems: "center" }}>
            {blockTypeIcons[block?.type]}
            {block?.type}
          </div>
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
};

const EmptyTreeNode = ({ id }: { id: string }) => {
  const { handleDropper } = useBlockHook();

  const handleDrop = (item: any) => {
    handleDropper(item, id);
  };

  return (
    <EmptyTreeNodeContainer onDrop={handleDrop}>
      DROP Nodes
    </EmptyTreeNodeContainer>
  );
};

const DroppableContainer = styled(Droppable)`
  height: 100%;
  width: 100%;
  margin-left: 0.25rem;
`;

const RootBlockContainer = styled.div`
  cursor: pointer;
  background: #f0f0f0;
`;

const HeaderContainer = styled.div`
  font-size: ${({ theme }) => theme.fontSize.labelHeader};
  border-bottom: 1px solid #dddddd;
  width: 97%;
  height: 3rem;
  display: flex;
  align-items: center;
  font-weight: 500;
  padding-left: 0.5rem;
`;

const NodeTree = () => {
  const { rootBlockOrder, handleDropper, setSelectedBlock, globalStyles } = useBlockHook();


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
    };
    setSelectedBlock(rootBlock);
  };

  return (
    <DroppableContainer
      accept="TREE_BLOCK"
      onDrop={handleDrop}
      onClick={() => { }}
    >
      <HeaderContainer>Layers</HeaderContainer>
      <RootBlockContainer onClick={handleRootClick}>
        Root Block
      </RootBlockContainer>
      {rootBlockOrder.map(renderBlockNode)}
    </DroppableContainer>
  );
};

export default NodeTree;
