import React, { useCallback, useMemo } from "react";
import BlockComponent from "./BlockComponent";
import { GridCellProps, IGridCellProps } from "../../types";
import { useBlockHook } from "context/BlockContext";
import GridEmptyCell from "./GridEmptyCell";
import { Icon } from "semantic-ui-react";

const GridCell: React.FC<GridCellProps> = ({
  cellWidth,
  blockId
}) => {

  const { setSelectedBlock, handleDropper , selectedBlock, blocks , onDeleteBlock } = useBlockHook();

  const block = useMemo(() => blocks[blockId], [blocks , blockId]);
    
  const handleGridCellDropper = (item: any) => {
    handleDropper(item, blockId, {dropIndex: 0});
  }

  const isSelected = useMemo(() => {
    return selectedBlock ? blockId === selectedBlock.id : false
  }, [selectedBlock, block])
  
  const handleCellBlockClick = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!isSelected) {
        setSelectedBlock(block);
      }
    },
    [isSelected, setSelectedBlock, block]
  );

  const handleDeleteClick = (e: React.MouseEvent , deleteBlockId: string) => {
    e.stopPropagation();
    onDeleteBlock(deleteBlockId)
    setSelectedBlock(null)
  };
  const renderGridCellChilds = (cellBlockId: string, index: number) => {
    const hasMultipleChildBlocks = block?.childBlocks?.length > 1;
  
    return (
      <div className="position-relative">
        <BlockComponent key={cellBlockId} blockId={cellBlockId} />
  
        {hasMultipleChildBlocks && cellBlockId === selectedBlock?.id && (
          <div
            style={{
              position: "absolute",
              top: "5px",
              right: "5px",
              cursor: "pointer",
              background: "white",
              borderRadius: "50%",
              padding: "5px",
            }}
            onClick={(e) => handleDeleteClick(e, cellBlockId)}
          >
            <Icon name="trash" />
          </div>
        )}
      </div>
    );
  };
  

  return (
    <td
      style={{
        border: blockId === selectedBlock?.id ? "2px solid blue" : "2px solid transparent",
        paddingTop: (block as IGridCellProps).padding?.top,
        paddingBottom: (block as IGridCellProps).padding?.bottom,
        paddingRight: (block as IGridCellProps).padding?.right,
        paddingLeft: (block as IGridCellProps).padding?.left,
        textAlign: "center",
        verticalAlign : (block as IGridCellProps)?.verticalAlignment,
        cursor: "pointer",
        position: "relative",
        width: `${Math.round(cellWidth)}px`,
        maxWidth: `${Math.round(cellWidth)}px`,
        backgroundColor: block?.backgroundColor || "",
      }}
      onClick={handleCellBlockClick}
    >
      {
        block?.childBlocks?.map(renderGridCellChilds)
      }

      {
        block?.childBlocks?.length === 0 && <GridEmptyCell handleDropper={handleGridCellDropper}/>
      }
    </td>
  );
};

export default GridCell;
