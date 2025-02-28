import React, { useCallback } from "react";
import BlockComponent from "../BlockComponent";
import Droppable from "../Droppable";
import EmptyBlock from "./EmptyBlock";
import { useBlockHook } from "context/BlockContext";
import styled, { useTheme } from "styled-components";
import { Block } from "types";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";

interface TableWrapperProps {
  canvasColor: string;
  canvasFont: string;
  canvasFontColor: string;
}

const BlockWrapper = styled.div<{ isSelected: boolean }>`
  cursor: pointer;
  border: ${({ isSelected }) => (isSelected ? "1px dashed #006E75" : "none")};
  border-radius: 10px;
  position: relative;
`;

const DeleteWrapper = styled.div`
   position: absolute;
   cursor: pointer;
   right: 28px; 
   bottom: 3px;
`;

const BaseComponet = styled.div`
   padding: 1rem;
    background: #FFFFFF;
     margin: 3rem;
`;

const TrashIconWrapper = styled.div`
  position: absolute;
  top: 0;
  right: -35px;
  border-radius: 50%;
  padding: 5px;
  cursor: pointer;
  z-index: 1000;
`;

const TableWrapper = styled.table<TableWrapperProps>`
&.ebr-tableWrapper{
  margin: 0 auto;
  width: 100%;
  background-color: ${({ canvasColor }) => canvasColor};
  font-family: ${({ canvasFont }) => canvasFont};
  color: ${({ canvasFontColor }) => canvasFontColor};
  border-collapse: collapse;
  table-layout: fixed;
  padding: 10px;
}
`;

const Canvas: React.FC = () => {
  const {
    selectedBlock,
    handleDropper,
    rootBlockOrder,
    setSelectedBlock,
    onDeleteBlock,
    globalStyles
  } = useBlockHook();
  const theme = useTheme();

  const handleDrop = useCallback(
    (item: { type: string; name: string; id: number }) => {
      handleDropper(item, undefined!);
    },
    [handleDropper]
  );

  const renderBlock = (blockId: string, index: number) => {
    return (
      <BlockWrapper key={blockId} isSelected={blockId === (selectedBlock as Block)?.id}>
        <BlockComponent blockId={blockId} />
        {blockId === (selectedBlock as Block)?.id && (
          <TrashIconWrapper
            onClick={(e) => {
              e.stopPropagation();
              onDeleteBlock(blockId);
              setSelectedBlock(null);
            }}
          >
            <DeleteWrapper><SvgIcon name={CUSTOM_SVG_ICON.DeleteBlock} /></DeleteWrapper>
          </TrashIconWrapper>
        )}
      </BlockWrapper>
    );
  };

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
      }}
      onClick={() => setSelectedBlock(null)}
    >
      <BaseComponet>
        {rootBlockOrder.length > 0 ? (
          <TableWrapper
            className="ebr-tableWrapper"
            canvasColor={globalStyles.canvasColor}
            canvasFont={globalStyles.fontFamily}
            canvasFontColor={globalStyles.textColor}
          >
            <tbody>
              <tr>
                <td style={{ padding: 0 }}>
                  {rootBlockOrder.map(renderBlock)}
                </td>
              </tr>
            </tbody>
            <EmptyBlock text="Drag & drop more elements to add." />
          </TableWrapper>
        ) : (
          <EmptyBlock text="Drag & drop elements here to start building " />
        )}
      </BaseComponet>
    </Droppable>
  );
};

export default React.memo(Canvas);
