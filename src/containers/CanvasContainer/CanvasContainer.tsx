import React, { useCallback, useMemo } from "react";
import BlockComponent from "../BlockComponent";
import Droppable from "../Droppable";
import EmptyBlock from "./EmptyBlock";
import { getDroppableStyles, getTableStyles } from "@utils/common";
import { useBlockHook } from "context/BlockContext";
import styled from "styled-components";

// Define the prop type for globalStyles
interface TableWrapperProps {
  globalStyles: any;
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
  ${({ globalStyles }) : any => getTableStyles(globalStyles) as React.CSSProperties};
  width: 100%;
`;

const Canvas: React.FC = () => {
  const {
    selectedBlock,
    handleDropper,
    rootBlockOrder,
    setSelectedBlock,
    globalStyles,
    onDeleteBlock,
  } = useBlockHook();

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
            {/* <Icon name="trash" /> */}
          </TrashIconWrapper>
        )}
      </BlockWrapper>
    );
  };

  const [droppableStyles] = useMemo(() => {
    return [getDroppableStyles(globalStyles)];
  }, [globalStyles]);

  return (
    <Droppable
      accept="BLOCK"
      onDrop={handleDrop}
      style={droppableStyles}
      onClick={() => setSelectedBlock(null)}
    >
      {rootBlockOrder.length > 0 ? (
        <TableWrapper globalStyles={globalStyles}>
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
