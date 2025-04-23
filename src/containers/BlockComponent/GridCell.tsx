import React, { useCallback, useMemo } from "react";
import styled from "styled-components";
import BlockComponent from "./BlockComponent";
import { GridCellProps, IGridCellProps } from "../../types";
import { useBlockHook } from "context/BlockContext";
import GridEmptyCell from "./GridEmptyCell";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";

// Extend the `StyledCell` with `shouldForwardProp`
const StyledCell = styled.td<{ $selected: boolean; $padding: IGridCellProps['padding']; $cellWidth: number; backgroundColor: string; $verticalAlign: string;}>`
  // border: ${({ $selected }) => ($selected ? "1px dashed #006E75" : "1px solid transparent")};
  border: ${({ $selected }) => ($selected ? "1px dashed #006E75" : "none")};
  padding-top: ${(props) => props.$padding?.top ? props.$padding?.top : 0}px;
  padding-bottom: ${(props) => props.$padding?.bottom ? props.$padding?.bottom : 0}px;
  padding-right: ${(props) => props.$padding?.right ? props.$padding?.right : 0}px;
  padding-left: ${(props) => props.$padding?.left ? props.$padding?.left : 0}px;
  text-align: center;
  vertical-align: ${(props) => (props as any).$verticalAlign || "middle"};
  cursor: pointer;
  position: relative;
  width: ${(props) => `${Math.round(props.$cellWidth)}px`};
  max-width: ${(props) => `${Math.round(props.$cellWidth)}px`};
  background-color: ${(props) => (props as any).backgroundColor || ""};

`;

// Define which props should be forwarded to the DOM element
StyledCell.shouldForwardProp = (prop) => !['selected', 'backgroundColor', 'cellWidth'].includes(prop);

const GridCellContainer = styled.div`
  position:relative;
`;

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
  
    return (
      <GridCellContainer key={cellBlockId}>
        <BlockComponent blockId={cellBlockId} />

        {cellBlockId === (selectedBlock as any)?.id && (
        <DeleteWrapper onClick={(e) => handleDeleteClick(e, cellBlockId)}>
          <SvgIcon name={CUSTOM_SVG_ICON.DeleteBlock} />
        </DeleteWrapper>
      )}
      </GridCellContainer>
    );
  };
  return (
    <StyledCell
      id={blockId}
      $selected={isSelected} 
      $padding={(block as any)?.padding || {}} 
      $cellWidth={cellWidth}
      backgroundColor={block.backgroundColor}
      $verticalAlign={(block as IGridCellProps).verticalAlign}
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
