import React, { useCallback } from "react";
import BlockComponent from "../BlockComponent";
import Droppable from "../Droppable";
import EmptyBlock from "./EmptyBlock";
import { useBlockHook } from "context/BlockContext";
import styled, { useTheme } from "styled-components";

interface TableWrapperProps {
  theme: {
    canvasColor: string;
    canvasFont: string;
    canvasFontSize: string;
  };
}

const BlockWrapper = styled.div<{ isSelected: boolean }>`
  cursor: pointer;
  border: ${({ isSelected }) => (isSelected ? "2px solid blue" : "none")};
  position: relative;
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
  margin: 0 auto;
  width: 600px;
  max-width: 600px;
  background-color: ${({ theme }) => theme.canvasColor};
  font-family: ${({ theme }) => theme.canvasFont};
  font-size: ${({ theme }) => theme.canvasFontSize};
  border-collapse: collapse;
  table-layout: fixed;
  height:100%
  padding:10px;
`;

const Canvas: React.FC = () => {
  const {
    selectedBlock,
    handleDropper,
    rootBlockOrder,
    setSelectedBlock,
    onDeleteBlock,
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
      <BlockWrapper key={blockId} isSelected={blockId === selectedBlock?.id}>
        <BlockComponent blockId={blockId} />
        {blockId === selectedBlock?.id && (
          <TrashIconWrapper
            onClick={(e) => {
              e.stopPropagation();
              onDeleteBlock(blockId);
              setSelectedBlock(null);
            }}
          >
            delete
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
        backgroundColor: theme.backgroundColor,
        height: "100%",
        padding: "1.5rem 0",
        fontSize: "1rem",
        color: "#F1F1F1",
        width: "100%",
        overflow: "auto",
      }}
      onClick={() => setSelectedBlock(null)}
    >
      {rootBlockOrder.length > 0 ? (
        <TableWrapper theme={{ backgroundColor: theme.backgroundColor, textColor: theme.textColor }}>
          <tbody>
            <tr>
              <td style={{ padding: 0 }}>{rootBlockOrder.map(renderBlock)}</td>
            </tr>
          </tbody>
        </TableWrapper>
      ) : (
        <EmptyBlock />
      )}
    </Droppable>
  );
};

export default React.memo(Canvas);
