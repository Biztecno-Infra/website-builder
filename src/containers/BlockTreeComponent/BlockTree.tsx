import React, { useCallback, useMemo, useState } from "react";
import { Icon } from "semantic-ui-react";
import { useDrag, useDrop } from "react-dnd";
import { Block, BlockType, GridProps } from "../../types";
import { useBlockHook } from "context/BlockContext";
import Droppable from "../Droppable";

interface BlockNodeProps {
  blockId: string;
}

// BlockNode component represents each block
const BlockNode = ({
  blockId
}: BlockNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    blocks,
    handleDropper,
    setSelectedBlock
  } = useBlockHook();

  const block: Block = useMemo(() => blocks[blockId], [blocks[blockId]]);

  const { hasChildBlocks, isEnableDrop }: {hasChildBlocks: boolean, isEnableDrop: boolean} = useMemo(() => {
    if(block) {
      return {
        hasChildBlocks: block.type === BlockType.GRID || block.type === BlockType.GRIDCELL,
        isEnableDrop: block.type !== BlockType.EMPTY
      }
    } else {
      return {
        hasChildBlocks: false,
        isEnableDrop: false
      }
    }
    
  }, [block]);

  // Toggle expand/collapse
  const toggleExpansion = useCallback((e: any) => {
    e.stopPropagation();
    setIsExpanded(prevs => !prevs);
  }, []);

  // Drag handling
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "TREE_BLOCK",
    item: { id: block?.id }, // Use block.id as a unique key
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: isEnableDrop
  }));

  // Drop handling
  const [, drop] = useDrop(() => ({
    accept: "TREE_BLOCK",
    canDrop: (item, monitor) => {
      return monitor.isOver({ shallow: true });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: isEnableDrop || monitor.canDrop(),
    }),
    drop: (item: { id: string }) => {
      handleDropper(item, block.id)
    }
  }));

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBlock(block);
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (block.type === BlockType.EMPTY) {
      alert("Empty blocks cannot be dragged.");
      e.preventDefault(); // Prevent dragging of empty blocks
    }
  };

  const renderChildNodes = (gridChildId: string, index: number) => {
    return <BlockNode key={gridChildId} blockId={gridChildId}/> 
  }

  return (
    <div
      ref={(node) => {if(node) drag(drop(node))}}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: block?.type === BlockType.EMPTY ? "not-allowed" : "move", 
      }}
      
      onDragStart={handleDragStart}
    >
      <div
        style={{
          // backgroundColor: block.id === selectedBlockId ? "#A9A9A9" : "#f1f1f1", // Apply selected background color for child block
          padding: "8px",
          cursor: hasChildBlocks ? "pointer" : "default",
          // border: "1px solid #ddd",
          display: "flex",
          alignItems: "center",
        }}
        onClick={handleClick}
      >
        {hasChildBlocks && (
          <Icon
            name={isExpanded ? "chevron down" : "chevron right"}
            style={{ marginRight: "10px", cursor: "pointer" }}
            onClick={toggleExpansion}

          />
        )}
        {block?.type} ({block?.id.substring(16)})
      </div>

      {isExpanded && hasChildBlocks &&  <div style={{paddingLeft: 8}}>
        {(block as GridProps)?.childBlocks.map(renderChildNodes)}
        {(block as GridProps)?.childBlocks.length === 0 && <EmptyTreeNode id={block.id}/>}
        </div>
      }
    </div>
  );
};

const EmptyTreeNode = ({id}: {id: string}) => {
  const {
    handleDropper
  } = useBlockHook();

  const handleDrop = (item: any) => {
    handleDropper(item, id); // TODO need change in droopper
  }


  return (<Droppable
    accept="TREE_BLOCK"
    onDrop={handleDrop}
    style={{
      paddingBottom: 50,
      paddingLeft: 16
    }}
    onClick={() => { }}
  >DROP Nodes</Droppable>)
}


// NodeTree component renders all blocks
const NodeTree = () => {
  const {
    rootBlockOrder,
    handleDropper
  } = useBlockHook();


  const renderBlockNode = (blockId: string) => {
    return (
      <BlockNode
        key={blockId}
        blockId={blockId}
      />
    )
  }

  const handleDrop = (item: any, item1: any ) => {
    handleDropper(item, undefined!);
  }

  return (
    <Droppable
      accept="TREE_BLOCK"
      onDrop={handleDrop}
      style={{
        minHeight: "100%",
        width: "100%",
        padding: "0.5rem",
        paddingBottom: 200
      }}
      onClick={() => {}}
    >
      {/* <div style={{ padding: "0.5rem" }}> */}
      {rootBlockOrder.map(renderBlockNode)}
    {/* </div> */}
    </Droppable>
    
  );
};

export default NodeTree;