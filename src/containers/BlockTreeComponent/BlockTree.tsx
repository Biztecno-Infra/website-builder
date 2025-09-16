import React, {
  JSX,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDrag, useDrop } from "react-dnd";
import { BlockType } from "email-builder-utils";
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
  HeaderContainer,
  RootBlockContainer,
} from "./style";
import { SizeEnum } from "enum";

interface BlockNodeProps {
  blockId: string;
  selectedBlock: any;
}

const getBlockTypeIcons = (
  color: string
): Record<BlockType, JSX.Element | null> => ({
  [BlockType.TEXT]: <SvgIcon name={CUSTOM_SVG_ICON.AddText} color={color} />,
  [BlockType.IMAGE]: <SvgIcon name={CUSTOM_SVG_ICON.AddImage} color={color} />,
  [BlockType.BUTTON]: (
    <SvgIcon name={CUSTOM_SVG_ICON.AddButton} color={color} />
  ),
  [BlockType.GRID]: <SvgIcon name={CUSTOM_SVG_ICON.AddColumns} color={color} />,
  [BlockType.SPACER]: (
    <SvgIcon name={CUSTOM_SVG_ICON.AddSpacer} color={color} />
  ),
  [BlockType.GRIDCELL]: (
    <SvgIcon name={CUSTOM_SVG_ICON.AddColumn} color={color} />
  ),
  [BlockType.DIVIDER]: <SvgIcon name={CUSTOM_SVG_ICON.AddLine} />,
  [BlockType.EMPTY]: <SvgIcon name={CUSTOM_SVG_ICON.Plus} />,
  [BlockType.EMAILLAYOUT]: null,
});
function isDescendant(
  blocks: Record<string, any>,
  ancestorId: string,
  targetId: string
): boolean {
  const visited = new Set();

  function dfs(currentId: string): boolean {
    if (visited.has(currentId)) return false;
    visited.add(currentId);

    const block = blocks[currentId];
    if (!block || !block.childBlocks) return false;

    if (block.childBlocks.includes(targetId)) return true;

    return block.childBlocks.some((childId: string) => dfs(childId));
  }

  return dfs(ancestorId);
}
const BlockNode = React.memo(({ blockId, selectedBlock }: BlockNodeProps) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const nodeRef = useRef<HTMLDivElement | null>(null);

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
      setSelectedBlock(block.id);
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
      <BlockNode
        key={gridChildId}
        blockId={gridChildId}
        selectedBlock={selectedBlock}
      />
    ),
    [selectedBlock]
  );

  const blockTypeIcons = getBlockTypeIcons(theme?.color?.buttonPrimary);
  useEffect(() => {
    if (selectedBlock?.id && isDescendant(blocks, blockId, selectedBlock.id)) {
      setIsExpanded(true);
    }
  }, [selectedBlock?.id, blockId, blocks]);
  const isSelected = selectedBlock?.id === blockId;
const isAncestorOfSelected = selectedBlock?.id && isDescendant(blocks, blockId, selectedBlock.id);
const isDescendantOfSelected = selectedBlock?.id && isDescendant(blocks, selectedBlock.id, blockId);
const hasChildren = Array.isArray(block?.childBlocks) && block.childBlocks.length > 0;

  console.log(block , "block in tree" , isSelected);
  return (
    <BlockContainer
      id={block.id}
      ref={(node) => {
        nodeRef.current = node;
        if (node) drag(drop(node));
      }}
  $isDragging={isDragging}
  $isSelected={isSelected}
  $isAncestor={isAncestorOfSelected}
  $isDescendant={isDescendantOfSelected}
      $hasChildBlocks={hasChildren}
      cursor={block?.type === BlockType.EMPTY ? "not-allowed" : "move"}
      onDragStart={handleDragStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <BlockContent onClick={handleClick} $hasChildBlocks={hasChildBlocks}>
        {hasChildBlocks && (
          <ChevronIcon data-isexpanded={isExpanded}>
            {isExpanded ? (
              <SvgIcon name={CUSTOM_SVG_ICON.ExpandIcon} />
            ) : (
              <SvgIcon name={CUSTOM_SVG_ICON.ArrowRight} />
            )}
          </ChevronIcon>
        )}
        <BlockContentText $isSelected={isSelected} >
          <BlockTextIcon style={{ width: "80%" }}>
            <BlockText style={{ width: "20%" }}>
              {blockTypeIcons[block?.type as BlockType]}
            </BlockText>
            <div style={{ fontSize: "12px", width: "80%" }}>
              {block?.layerName || block?.type}
            </div>
          </BlockTextIcon>
          {isHovered && (
            <SvgIcon
              name={CUSTOM_SVG_ICON.DragIcon}
              svgStyle={{ width: "20%" }}
            />
          )}
        </BlockContentText>
      </BlockContent>

      {isExpanded && hasChildBlocks && (
        <ChildNodesContainer>
          {(block as GridProps)?.childBlocks.map(renderChildNodes)}
          {(block as GridProps)?.childBlocks.length === 0 && (
            <EmptyTreeNode id={block.id} theme={theme} />
          )}
        </ChildNodesContainer>
      )}
    </BlockContainer>
  );
});

const EmptyTreeNodeContainer = styled(Droppable)`
  border: 1px dashed ${({ theme }) => theme.colors.primary};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: #8d8d8d;
  border-radius: 5px;
  padding: 1rem 0;
  font-size: 11px;
  background-color: #ffffff;
`;

const EmptyTreeNode = ({ id, theme }: { id: string; theme: any }) => {
  const { handleDropper } = useBlockHook();

  const handleDrop = useCallback(
    (item: any) => {
      handleDropper(item, id);
    },
    [handleDropper, id]
  );

  return (
    <EmptyTreeNodeContainer
      accept="TREE_BLOCK"
      onDrop={handleDrop}
      theme={theme}
    >
      Drag and drop a layer here
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

const ScrollHead = styled.div`
  height: calc(100% - 3rem);
  overflow-y: auto;
  /* z-index: -1; */
`;

const NodeTree = () => {
  const theme = useTheme();
  const {
    rootBlockOrder,
    handleDropper,
    setSelectedBlock,
    globalStyles,
    selectedBlock,
  } = useBlockHook();

  // 1. Ref for scroll container
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // 2. Scroll to the selected block
  useEffect(() => {
    if ((selectedBlock as Block)?.id && scrollContainerRef.current) {
      // Find the node that corresponds to selectedBlock
      const selectedNode = document.getElementById(
        (selectedBlock as Block)?.id
      );
      if (selectedNode) {
        selectedNode.scrollIntoView({
          behavior: "smooth", // Smooth scroll effect
          block: "center", // Center the selected block in the view
        });
      }
    }
  }, [(selectedBlock as Block)?.id]);

  const renderBlockNode = useCallback(
    (blockId: string) => (
      <BlockNode
        key={blockId}
        blockId={blockId}
        selectedBlock={selectedBlock}
      />
    ),
    [selectedBlock]
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
        style: globalStyles,
        childrenIds: rootBlockOrder,
      },
    };
    setSelectedBlock(rootBlock.type);
  }, [rootBlockOrder, globalStyles, setSelectedBlock]);

  return (
    <DroppableContainer accept="TREE_BLOCK" onDrop={handleDrop}>
      <HeaderContainer>Layers</HeaderContainer>
      <ScrollHead ref={scrollContainerRef}>
        <RootBlockContainer onClick={handleRootClick} $isSelected={selectedBlock?.type === "EmailLayout"}>
          <SvgIcon
            name={CUSTOM_SVG_ICON.GlobalSettings}
            size={SizeEnum.Small}
            svgStyle={{ width: "20%", color: selectedBlock?.type === "EmailLayout" ? "#ffffff" :theme.colors.primary }}
          />
          <BlockContentText style={{ width: "80%", cursor: "pointer" }}$isSelected={selectedBlock?.type === "EmailLayout"}>
            Global Settings
          </BlockContentText>
        </RootBlockContainer>
        {rootBlockOrder.map(renderBlockNode)}
      </ScrollHead>
    </DroppableContainer>
  );
};

export default NodeTree;
