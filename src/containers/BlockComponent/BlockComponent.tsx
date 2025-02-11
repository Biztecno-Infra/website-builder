import React, { useMemo, useCallback } from "react";
import {
  BlockType,
  ButtonProps,
  DividerProps,
  ImageProps,
  SpacerProps,
  TextProps,
  BlockComponentProps
} from "../../types";
import { TextBlock } from "./TextBlock";
import { ImageBlock } from "./ImageBlock";
import { ButtonBlock } from "./ButtonBlock";
import GridBlock from "./GridBlock";
import { useBlockHook } from "context/BlockContext";
import { DividerBlock } from "./DividerBlock";
import { SpacerBlock } from "./SpacerBlock";

const BlockComponent: React.FC<BlockComponentProps> = React.memo(
  ({ blockId }) => {
    const { blocks, handleDropper, setSelectedBlock, selectedBlock } =
      useBlockHook();

    const block = useMemo(() => blocks[blockId], [blocks, blockId]);

    const isSelected = useMemo(() => {
      return selectedBlock ? blockId === selectedBlock.id : false;
    }, [selectedBlock, block]);

    const handleBlockClick = useCallback(
      (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!isSelected) {
          setSelectedBlock(block);
        }
      },
      [isSelected, setSelectedBlock, block]
    );

    const renderBlock = useMemo(() => {
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
        default:
          return null;
      }
    }, [block, handleDropper, handleBlockClick, isSelected]);

    return renderBlock;
  }
);

export default BlockComponent;
