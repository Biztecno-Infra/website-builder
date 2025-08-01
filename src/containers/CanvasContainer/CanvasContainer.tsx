import React, { useCallback, useEffect, useRef, useState } from "react";
import BlockComponent from "../BlockComponent";
import Droppable from "../Droppable";
import EmptyBlock from "./EmptyBlock";
import { useBlockHook } from "context/BlockContext";
import styled, { useTheme } from "styled-components";
import { Block, Padding } from "types";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { ScreenViews } from "enum";
import { useDrag, useDrop } from "react-dnd";

// import domtoimage from "dom-to-image";
interface TableWrapperProps {
  $canvasColor: string;
  $canvasFont: string;
  $canvasFontColor: string;
  $canvasPadding: Padding;
  $isMobile: boolean;
}

const BlockWrapper = styled.div<{ $isSelected: boolean; theme: any }>`
  cursor: pointer;
  border: ${({ $isSelected, theme }) =>
    $isSelected ? `1px dashed ${theme.colors.primary}` : "none"};
  position: relative;
`;

const CanvasDropable = styled.div`
  padding: 3rem;
`;

const DeleteWrapper = styled.div`
  position: absolute;
  cursor: pointer;
  right: 28px;
  bottom: 3px;
`;

const TrashIconWrapper = styled.div`
  position: absolute;
  top: 0;
  right: -35px;
  border-radius: 50%;
  padding: 5px;
  cursor: pointer;
  z-index: 998;
`;

const TableWrapper = styled.table<TableWrapperProps>`
  &.ebr-tableWrapper {
    margin: 0 auto;
    background-color: ${({ $canvasColor }) => $canvasColor};
    font-family: ${({ $canvasFont }) => $canvasFont};
    color: ${({ $canvasFontColor }) => $canvasFontColor};
    // border-collapse: collapse;
    table-layout: fixed;
    width: ${({ $isMobile }) => ($isMobile ? "360px" : "600px")};
    max-width: ${({ $isMobile }) => ($isMobile ? "360px" : "600px")};

    @media screen and (max-width: 600px) {
      width: 360px !important;
      max-width: 360px !important;
    }
  }
`;

const Canvas = () => {
  const {
    selectedBlock,
    handleDropper,
    rootBlockOrder,
    setSelectedBlock,
    onDeleteBlock,
    globalStyles,
    selectedView,
    canvasRef,
    blocks,
  } = useBlockHook();

  const theme = useTheme();
  // const canvasDropableRef = useRef<HTMLDivElement>(null);

  const handleDrop = useCallback(
    (item: { type: string; name: string; id: number }) => {
      handleDropper(item, undefined!);
    },
    [handleDropper]
  );

  // const renderBlock = (blockId: string, index: number) => {
  //   return (
  //     <BlockWrapper
  //       key={blockId}
  //       id={blockId}
  //       $isSelected={blockId === (selectedBlock as Block)?.id}
  //       theme={theme}
  //     >
  //       <BlockComponent blockId={blockId} />
  //       {blockId === (selectedBlock as Block)?.id && (
  //         <TrashIconWrapper
  //           onClick={(e) => {
  //             e.stopPropagation();
  //             onDeleteBlock(blockId);
  //             setSelectedBlock(null);
  //           }}
  //         >
  //           <DeleteWrapper>
  //             <SvgIcon name={CUSTOM_SVG_ICON.DeleteBlock} />
  //           </DeleteWrapper>
  //         </TrashIconWrapper>
  //       )}
  //     </BlockWrapper>
  //   );
  // };

  // useEffect(() => {
  //   if (typeof onSave === "function") {
  //     const handleCaptureScreenshot = async () => {
  //       const screenshot = await captureScreenshot();
  //       onSave(screenshot); // Send the screenshot file back to onSave callback
  //     };

  //     handleCaptureScreenshot();
  //   }
  // }, [onSave]); // T

  const DraggableBlock = React.memo(({ blockId }: { blockId: string }) => {
    const theme = useTheme();
    const {
      blocks,
      selectedBlock,
      setSelectedBlock,
      onDeleteBlock,
      handleDropper,
    } = useBlockHook();
    const block = blocks[blockId];
    const blockType = block?.type;

    const [{ isDragging }, drag] = useDrag({
      type: "TREE_BLOCK",
      item: { id: blockId },
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });

    const [, drop] = useDrop({
      accept: "TREE_BLOCK",
      drop: (item: { id: string }) => {
        if (item.id !== blockId) handleDropper(item, blockId);
      },
    });

    const [isHovered, setIsHovered] = useState(false);

    return (
      <BlockWrapper
        ref={(node) => {
          if (node) drag(drop(node));
        }}
        $isSelected={(selectedBlock as Block)?.id === blockId}
        theme={theme}
        style={{
          opacity: isDragging ? 0.3 : 1,
          backgroundColor: isHovered
            ? theme.colors.hoverBg || "#f0f0f0"
            : "transparent",
          transition: "background-color 0.2s ease",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isHovered && (
          <div style={{ top: 0, position: "absolute", right: 0 }}>
            {blockType}
          </div>
        )}
        <BlockComponent blockId={blockId} />
        {(selectedBlock as Block)?.id === blockId && (
          <TrashIconWrapper
            onClick={(e) => {
              e.stopPropagation();
              onDeleteBlock(blockId);
              setSelectedBlock(null);
            }}
          >
            <DeleteWrapper>
              <SvgIcon name={CUSTOM_SVG_ICON.DeleteBlock} />
            </DeleteWrapper>
          </TrashIconWrapper>
        )}
      </BlockWrapper>
    );
  });

  const renderBlock = (blockId: string) => (
    <DraggableBlock key={blockId} blockId={blockId} />
  );

  return (
    <Droppable
      accept="BLOCK"
      onDrop={handleDrop}
      style={{
        backgroundColor: theme.canvas.backgroundColor,
        height: "100%",
        fontSize: "1rem",
        width: "calc(100% - 20.4rem)",
        overflowX: "hidden",
        overflowY: "auto",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        fontFamily: globalStyles.fontFamily,
      }}
      onClick={() => setSelectedBlock(null)}
    >
      <CanvasDropable>
        <div
          style={{
            padding: rootBlockOrder.length === 0 ? 15 : 0,
            background: rootBlockOrder.length === 0 ? "#ffffff" : "none",
          }}
          // ref={canvasRef}
        >
          {rootBlockOrder.length > 0 ? (
            <TableWrapper
              className="ebr-tableWrapper"
              $canvasColor={globalStyles.canvasColor}
              $canvasFont={globalStyles.fontFamily}
              $canvasFontColor={globalStyles.textColor}
              $canvasPadding={globalStyles.padding}
              $isMobile={selectedView === ScreenViews.MOBILE}
              ref={canvasRef}
              style={{
                border: globalStyles.borderWidth
                  ? `${globalStyles.borderWidth}px ${globalStyles.borderStyle} ${globalStyles.borderColor}`
                  : "none",
                borderRadius: globalStyles.borderRadius
                  ? `${globalStyles.borderRadius}px`
                  : "0",
              }}
            >
              <tbody>
                <tr style={{ padding: 0 }}>
                  <td
                    style={{
                      paddingTop: globalStyles?.padding?.top,
                      paddingRight: globalStyles?.padding?.right,
                      paddingBottom: globalStyles?.padding?.bottom,
                      paddingLeft: globalStyles?.padding?.left,
                    }}
                  >
                    {rootBlockOrder.map(renderBlock)}
                  </td>
                </tr>
              </tbody>
            </TableWrapper>
          ) : (
            <EmptyBlock
              theme={theme!}
              text="Drag & drop elements here to start building "
            />
          )}
        </div>
      </CanvasDropable>
    </Droppable>
  );
};

export default React.memo(Canvas);
