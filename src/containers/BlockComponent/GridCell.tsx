import React, { useCallback, useMemo } from "react";
import styled, { useTheme } from "styled-components";
import BlockComponent from "./BlockComponent";
import { GridCellProps, IGridCellProps, Padding } from "../../types";
import { useBlockHook } from "context/BlockContext";
import GridEmptyCell from "./GridEmptyCell";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { shouldHideOnCanvas } from "@utils/common";

// Extend the `StyledCell` with `shouldForwardProp`
const StyledCell = styled.td<{
  $selected: boolean;
  $padding: Padding;
  $cellWidth: number;
  backgroundColor: string;
  $verticalAlign: string;
  theme: any;
}>`
  padding-top: ${(props) => (props.$padding?.top ? props.$padding?.top : 0)}px;
  padding-bottom: ${(props) =>
    props.$padding?.bottom ? props.$padding?.bottom : 0}px;
  padding-right: ${(props) =>
    props.$padding?.right ? props.$padding?.right : 0}px;
  padding-left: ${(props) =>
    props.$padding?.left ? props.$padding?.left : 0}px;
  text-align: center;
  vertical-align: ${(props) => (props as any).$verticalAlign || "middle"};
  cursor: pointer;
  position: relative;
  width: ${(props) => `${Math.round(props.$cellWidth)}px`};
  max-width: ${(props) => `${Math.round(props.$cellWidth)}px`};
  background-color: ${(props) => (props as any).backgroundColor || ""};
`;

// Define which props should be forwarded to the DOM element
StyledCell.shouldForwardProp = (prop) =>
  !["selected", "backgroundColor", "cellWidth"].includes(prop);

const GridCellContainer = styled.div`
  position: relative;
`;

const DeleteWrapper = styled.div`
  position: absolute;
  cursor: pointer;
  right: -13px;
  top: -14px;
  z-index: 100;
`;

const GridCell: React.FC<GridCellProps> = ({ cellWidth, blockId }) => {
  const {
    setSelectedBlock,
    handleDropper,
    selectedBlock,
    blocks,
    onDeleteBlock,
    selectedView,
  } = useBlockHook();
  const theme = useTheme();

  const block = useMemo(() => blocks[blockId], [blocks, blockId]);
  const isHidden = shouldHideOnCanvas(block, selectedView);

  const handleGridCellDropper = (item: any) => {
    handleDropper(item, blockId, { dropIndex: 0 });
  };

  const isSelected = useMemo(() => {
    return selectedBlock ? blockId === (selectedBlock as any).id : false;
  }, [selectedBlock, block]);

  const handleCellBlockClick = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!isSelected) {
        setSelectedBlock(block.id);
      }
    },
    [isSelected, setSelectedBlock, block]
  );

  const handleDeleteClick = (e: React.MouseEvent, deleteBlockId: string) => {
    e.stopPropagation();
    onDeleteBlock(deleteBlockId);
    setSelectedBlock(null);
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

  const {
    backgroundImage,
    backgroundPosition,
    backgroundRepeat,
    backgroundSize,
    padding,
    backgroundColor,
    verticalAlign,
    childBlocks,
    id,
    type,
    layerName,
    parentId,
    ...rest
  } = block as IGridCellProps;
  const backgroundImageStyle = backgroundImage
    ? {
        backgroundImage: backgroundImage.startsWith("url")
          ? backgroundImage
          : `url(${backgroundImage})`,
        backgroundPosition: backgroundPosition,
        backgroundRepeat: backgroundRepeat,
        backgroundSize: backgroundSize,
      }
    : {};
  if (isHidden) {
    // Option 1: fully hide
    // return null;

    // ✅ Option 2: ghosted preview (recommended)
    return (
      <StyledCell
        id={`block-${block.id}`}
        $selected={isSelected}
        $padding={(padding as Padding) || {}}
        $cellWidth={cellWidth}
        backgroundColor={backgroundColor}
        $verticalAlign={verticalAlign as string}
        onClick={handleCellBlockClick}
        theme={theme}
        style={{
          ...backgroundImageStyle,
          outline: `1px dashed ${
            isSelected && block.parentId ? theme.colors.primary : "transparent"
          }`,
          opacity: 0.4,
          pointerEvents: "none",
          position: "relative",
          border: "1px dashed #ff9800",
          background: "rgba(255, 152, 0, 0.05)",
          ...rest,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            right: 2,
            background: "#ff9800",
            color: "#fff",
            fontSize: "10px",
            padding: "2px 4px",
            borderRadius: "2px",
            zIndex: 1,
          }}
        >
          Hidden on {selectedView}
        </div>

        {block?.childBlocks?.map(renderGridCellChilds)}

        {block?.childBlocks?.length === 0 && (
          <GridEmptyCell handleDropper={handleGridCellDropper} />
        )}
      </StyledCell>
    );
  } else {
    return (
      <StyledCell
        id={`block-${block.id}`}
        $selected={isSelected}
        $padding={(padding as Padding) || {}}
        $cellWidth={cellWidth}
        backgroundColor={backgroundColor}
        $verticalAlign={verticalAlign as string}
        onClick={handleCellBlockClick}
        theme={theme}
        style={{
          ...backgroundImageStyle,
          outline: `1px dashed ${
            isSelected && block.parentId ? theme.colors.primary : "transparent"
          }`,
          ...rest,
        }}
      >
        {block?.childBlocks?.map(renderGridCellChilds)}

        {block?.childBlocks?.length === 0 && (
          <GridEmptyCell handleDropper={handleGridCellDropper} />
        )}
      </StyledCell>
    );
  }
};

export default GridCell;
