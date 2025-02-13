import React, { useCallback, useMemo } from "react";
import BlockComponent from "./BlockComponent";
import { GridCellProps, IGridCellProps } from "../../types";
import { useBlockHook } from "context/BlockContext";
import GridEmptyCell from "./GridEmptyCell";
import styled from "styled-components";

// Styled component for the delete button container
const DeleteButton = styled.div`
  position: absolute;
  top: 5px;
  right: 5px;
  cursor: pointer;
  background: white;
  border-radius: 50%;
  padding: 5px;
`;

// Styled component for the grid cell
const StyledCell = styled.td<{ selected: boolean; padding: IGridCellProps['padding']; cellWidth: number }>`
  border: ${(props) => (props.selected ? "2px solid blue" : "2px solid transparent")};
  padding-top: ${(props) => props.padding?.top};
  padding-bottom: ${(props) => props.padding?.bottom};
  padding-right: ${(props) => props.padding?.right};
  padding-left: ${(props) => props.padding?.left};
  text-align: center;
  vertical-align: ${(props) => (props as any).verticalAlignment || "middle"};
  cursor: pointer;
  position: relative;
  width: ${(props) => `${Math.round(props.cellWidth)}px`};
  max-width: ${(props) => `${Math.round(props.cellWidth)}px`};
  background-color: ${(props) => (props as any).backgroundColor || ""};
`;

const GridCellContainer = styled.div`
position:relative `;

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
      <GridCellContainer key={cellBlockId}>
        <BlockComponent blockId={cellBlockId} />
  
        {hasMultipleChildBlocks && cellBlockId === selectedBlock?.id && (
          <DeleteButton onClick={(e) => handleDeleteClick(e, cellBlockId)}>
            delete
            {/* <Icon name="trash" /> */}
          </DeleteButton>
        )}
      </GridCellContainer>
    );
  };
  

  return (
    <StyledCell 
      selected={isSelected} 
      padding={(block as any)?.padding || {}} 
      cellWidth={cellWidth}
      onClick={handleCellBlockClick}
    >
      {
        block?.childBlocks?.map(renderGridCellChilds)
      }

      {
        block?.childBlocks?.length === 0 && <GridEmptyCell handleDropper={handleGridCellDropper}/>
      }
    </StyledCell>
  );
};

export default GridCell;
