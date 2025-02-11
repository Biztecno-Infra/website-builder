import React, { useCallback, useMemo } from "react";
import { Icon } from "semantic-ui-react";
import BlockComponent from "../BlockComponent";
import Droppable from "../Droppable";
import EmptyBlock from "./EmptyBlock";
import { getDroppableStyles, getTableStyles } from "@utils/common";
import { useBlockHook } from "context/BlockContext";
import "./style.scss";

const Canvas: React.FC = () => {

  const {
    selectedBlock,
    handleDropper,
    rootBlockOrder,
    setSelectedBlock,
    globalStyles,
    onDeleteBlock
  } = useBlockHook();

  const handleDrop = useCallback((
    item: { type: string; name: string; id: number},
  ) => {
    handleDropper(item, undefined!);
  }, [handleDropper])

  const renderBlock = (blockId: string, index: number) => {
    return (
      <div
        key={blockId}
        style={{
          cursor: "pointer",
          border: blockId === selectedBlock?.id ? "2px solid blue" : "none",
          position: "relative",
        }}
      >
        <BlockComponent
          blockId={blockId}
        />

        {blockId === selectedBlock?.id && (
          <div
            style={{
              position: "absolute",
              top: 0,
              right: -35,
              borderRadius: "50%",
              padding: "5px",
              cursor: "pointer",
              zIndex: 1000,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteBlock(blockId);
              setSelectedBlock(null);
            }}
          >
            <Icon name="trash" />
          </div>
        )}
      </div>
    )
  } 
 

  const [droppableStyles, tableStyles] = useMemo(() => {
    return [getDroppableStyles(globalStyles), getTableStyles(globalStyles)];
  }, [globalStyles]);

  return (
    <Droppable
      accept="BLOCK"
      onDrop={handleDrop}
      style={droppableStyles}
      onClick={() => setSelectedBlock(null)}
    >
      {rootBlockOrder.length > 0 ? (
        <table style={tableStyles as React.CSSProperties}>
          <tbody>
            <tr>
              <td style={{padding:0}}>{rootBlockOrder.map(renderBlock)}</td>
            </tr>
          </tbody>
        </table>
      ) : (
        <EmptyBlock />
      )}
    </Droppable>
  );
};

export default React.memo(Canvas);
