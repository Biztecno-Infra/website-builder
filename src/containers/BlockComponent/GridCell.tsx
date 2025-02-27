import React, { useCallback, useMemo } from "react";
import BlockComponent from "./BlockComponent";
import { GridCellProps, IGridCellProps } from "../../types";
import { useBlockHook } from "context/BlockContext";
import GridEmptyCell from "./GridEmptyCell";
import styled from "styled-components";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";


// Styled component for the grid cell
const StyledCell = styled.td<{ selected: boolean; padding: IGridCellProps['padding']; cellWidth: number }>`
  border: ${({ selected }) => (selected ? "1px dashed #006E75" : "none")};
  padding-top: ${(props) => props.padding?.top}px;
  padding-bottom: ${(props) => props.padding?.bottom}px;
  padding-right: ${(props) => props.padding?.right}px;
  padding-left: ${(props) => props.padding?.left}px;
  text-align: center;
  vertical-align: ${(props) => (props as any).verticalAlignment || "middle"};
  cursor: pointer;
  position: relative;
  width: ${(props) => `${Math.round(props.cellWidth)}px`};
  max-width: ${(props) => `${Math.round(props.cellWidth)}px`};
  background-color: ${(props) => (props as any).backgroundColor || ""};
    border-radius: 10px;
`;

const GridCellContainer = styled.div`
position:relative `;

const DeleteWrapper = styled.div`
  position: absolute;
  cursor: pointer;
  right: -13px;
  top: -14px;
  z-index: 100;
`;

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
    return selectedBlock ? blockId === (selectedBlock as any).id : false
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

        {hasMultipleChildBlocks &&
          cellBlockId === (selectedBlock as any)?.id && (
            <DeleteWrapper onClick={(e) => handleDeleteClick(e, cellBlockId)}>
              <SvgIcon name={CUSTOM_SVG_ICON.DeleteBlock} />
            </DeleteWrapper>
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
