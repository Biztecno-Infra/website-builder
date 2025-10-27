import React, { useMemo, useCallback } from "react";
import {
  type ButtonProps,
  type DividerProps,
  type ImageProps,
  type SpacerProps,
  type TextProps,
  type BlockComponentProps,
  type Block,
  type VideoProps,
  type VDividerProps,
} from "../../types";
import { TextBlock } from "./TextBlock";
import { ImageBlock } from "./ImageBlock";
import { ButtonBlock } from "./ButtonBlock";
import GridBlock from "./GridBlock";
import { useBlockHook } from "context/BlockContext";
import { DividerBlock } from "./DividerBlock";
import { SpacerBlock } from "./SpacerBlock";
import { BlockType } from "email-builder-utils";
import ShapeBlock from "./ShapeBlock";
import VideoBlock from "./VideoBlock";
import { VerticalDividerBlock } from "./VerticalDividerBlock";
import { shouldHideOnCanvas } from "@utils/common";

const BlockComponent: React.FC<BlockComponentProps> = React.memo(
  ({ blockId }) => {
    const { blocks, handleDropper, setSelectedBlock, selectedBlock , selectedView } =
      useBlockHook();


  const block = useMemo(() => blocks[blockId], [blocks, blockId]);
  const isSelected = useMemo(() => {
    return selectedBlock ? blockId === (selectedBlock as Block).id : false;
  }, [selectedBlock, blockId]);

  const handleBlockClick = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!isSelected) {
        setSelectedBlock(block.id);
      }
    },
    [isSelected, setSelectedBlock, block]
  );

  const renderBlock = useMemo(() => {
    if (!block) return null;
    switch (block?.type) {
      case BlockType.TEXT:
        return (
          <TextBlock
            block={block as TextProps}
            handleDropper={handleDropper}
            handleBlockClick={handleBlockClick}
            isSelected={isSelected}
          />
        );
      case BlockType.IMAGE:
        return (
          <ImageBlock
            block={block as ImageProps}
            handleDropper={handleDropper}
            handleBlockClick={handleBlockClick}
            isSelected={isSelected}
          />
        );
      case BlockType.BUTTON:
        return (
          <ButtonBlock
            block={block as ButtonProps}
            handleDropper={handleDropper}
            handleBlockClick={handleBlockClick}
            isSelected={isSelected}
          />
        );
      case BlockType.GRID:
        return <GridBlock block={block} isSelected={isSelected} />;
      case BlockType.DIVIDER:
        return (
          <DividerBlock
            block={block as DividerProps}
            handleDropper={handleDropper}
            handleBlockClick={handleBlockClick}
            isSelected={isSelected}
          />
        );
      case BlockType.SPACER:
        return (
          <SpacerBlock
            block={block as SpacerProps}
            handleDropper={handleDropper}
            handleBlockClick={handleBlockClick}
            isSelected={isSelected}
          />
        );
      case BlockType.SHAPE:
        return (
          <ShapeBlock
            block={block as any}
            handleDropper={handleDropper}
            handleBlockClick={handleBlockClick}
            isSelected={isSelected}
          />
        );
      case BlockType.VIDEO:
        return (
          <VideoBlock
            block={block as VideoProps}
            handleDropper={handleDropper}
            handleBlockClick={handleBlockClick}
            isSelected={isSelected}
          />
        );
      case BlockType.VDivider:
        return (
          <VerticalDividerBlock
            block={block as VDividerProps}
            handleDropper={handleDropper}
            handleBlockClick={handleBlockClick}
            isSelected={isSelected}
          />
        );
      default:
        return null;
    }
  }, [block, handleDropper, handleBlockClick, isSelected , selectedView]);

  const isHidden = shouldHideOnCanvas(block, selectedView);
  console.log(isHidden ? `Block ${blockId} is hidden on ${selectedView}` : `Block ${blockId} is visible on ${selectedView}`);

  if (isHidden) {
    return (
      <div
        onClick={handleBlockClick}
        style={{
          opacity: 0.4,
          pointerEvents: "none",
          position: "relative",
          border: "1px dashed #ff9800",
          borderRadius: "4px",
          background: "rgba(255, 152, 0, 0.05)",
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
        {renderBlock}
      </div>
    );
  }

  return renderBlock;
});

export default BlockComponent;
