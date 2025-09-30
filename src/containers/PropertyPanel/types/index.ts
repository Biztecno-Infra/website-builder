import { TextProps, ImageProps, ButtonProps, GridProps, IGridCellProps, VideoProps, ShapeProps } from "../../../types";

export interface BlockFormProps {
  selectedBlock: TextProps | ImageProps | ButtonProps | GridProps | IGridCellProps | VideoProps |ShapeProps; 
  updateBlock: (blockId: string, property: string, value: any) => void; 
}