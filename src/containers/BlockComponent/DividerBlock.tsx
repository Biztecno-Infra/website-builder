import React, { useCallback, useMemo } from "react";
import Droppable from "../Droppable";
import { TextAlign , DividerBlockProps} from "../../types";
import { parseCssString } from "@utils/index";

export const DividerBlock: React.FC<DividerBlockProps> = ({
  block,
  handleDropper,
  handleBlockClick,
  isSelected,
}) => {
  const { backgroundColor, thickness, alignment, padding, dividerColor , customCss } =
    block;

  const handleDrop = useCallback(
    (item: { type: string; name: string; id: number }) => {
      handleDropper(item, block.id);
    },
    [handleDropper]
  );
console.log(thickness)
  const customStyles = useMemo(() => parseCssString(customCss || ""), [customCss]);

  return (
    <Droppable
      accept="BLOCK"
      onDrop={handleDrop}
      style={{
        paddingTop: `${padding.top}px`,
        paddingRight: `${padding.right}px`,
        paddingBottom: `${padding.bottom}px`,
        paddingLeft: `${padding.left}px`,
        backgroundColor,
        textAlign: alignment as TextAlign,
        border: `1px dashed ${isSelected && block.parentId ? "#006E75" : "transparent"}`,
        ...customStyles
      }}
      onClick={handleBlockClick}
    >
      <hr
        style={{
          height: thickness,
          backgroundColor: dividerColor,
          margin: 0
        }}
      />
    </Droppable>
  );
};
