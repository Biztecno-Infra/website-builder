import React, { useCallback } from "react";
import styled from "styled-components";
import Droppable from "@containers/Droppable/Droppable";
import { useBlockHook } from "@context/BlockContext";
import BlockComponent from "./BlockComponent";


const ShapeWrapper = styled.div<{
  $background: string;
  $width: string;
  $height: string;
  $borderRadius: string;
  $zIndex?: number;
}>`
  position: relative;
  display: block;
  width: ${(p) => p.$width}px;
  height: ${(p) => p.$height}px;
  background: ${(p) => p.$background};
  border-radius: ${(p) => p.$borderRadius};
  overflow: hidden;
  box-sizing: border-box;
  z-index: ${(p) => (p.$zIndex ?? 0)};
`;

// children container sits above the shape background so you can drop blocks "on top"
const ChildrenContainer = styled.div`
  position: absolute;
  inset: 0;
  display: block;
`;

const ShapeBlock: React.FC<{
  block: any;
  handleBlockClick: (e?: React.MouseEvent) => void;
  isSelected: boolean;
  handleDropper: any;
}> = ({ block, handleBlockClick, isSelected, handleDropper }) => {
  const { blocks } = useBlockHook();

  const {
    shape,
    width = "100%",
    height = "150px",
    backgroundColor = "#2F80ED",
    borderRadius,
    text,
    textColor = "#ffffff",
    // zIndex = 0,
  } = block as any;

  const borderRadiusMap: Record<string, string> = {
    rectangle: "0",
    rounded: "10px",
    circle: "50%",
    oval: "50% / 30%",
  };
  const resolvedBorderRadius = borderRadius || borderRadiusMap[shape] || "0";

  const handleDrop = useCallback(
    (item: { id: string; type: string }) => {
      handleDropper(item, block.id);
    },
    [handleDropper, block.id]
  );

  return (
    <Droppable accept="BLOCK" onDrop={handleDrop} style={{ display: "block" }} onClick={handleBlockClick}>
      <ShapeWrapper
        role="group"
        aria-label={`shape-${block.id}`}
        $background={backgroundColor}
        $width={width}
        $height={height}
        $borderRadius={resolvedBorderRadius}
        // $zIndex={zIndex}
      >
        {/* Optional centered label/text */}
        {text ? (
          <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", color: textColor, pointerEvents: "none" }}>
            {text}
          </div>
        ) : null}

      </ShapeWrapper>
    </Droppable>
  );
};

export default ShapeBlock;