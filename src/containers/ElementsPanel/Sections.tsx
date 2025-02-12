import { StyledBlockItem } from "@utils/index";
import React from "react";
import { useDrag } from "react-dnd";
import { IStyledBlockItemProps } from "types";

export interface IElements extends IStyledBlockItemProps {
  type: string;
  name: string;
}

export const BlockItem: React.FC<IElements> = ({
  type,
  name,
  padding = "10px",
  border = "1px solid #ccc",
  marginBottom = "10px",
  cursor = "pointer",
  width = "90%",
  textAlign = "center",
  backgroundColor,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "BLOCK",
    item: { type, name },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <StyledBlockItem
      ref={drag}
      isDragging={isDragging}
      padding={padding}
      border={border}
      marginBottom={marginBottom}
      cursor={cursor}
      width={width}
      textAlign={textAlign}
      backgroundColor={backgroundColor || (isDragging ? "#f0f0f0" : "#fff")}
    >
      {name}
    </StyledBlockItem>
  );
};