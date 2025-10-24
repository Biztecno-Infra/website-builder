import { TextProps, ImageProps, ButtonProps, GridProps, IGridCellProps, VideoProps, ShapeProps, VDividerProps } from "../../../types";

export interface BlockFormProps {
  selectedBlock: TextProps | ImageProps | ButtonProps | GridProps | IGridCellProps | VideoProps |ShapeProps | VDividerProps; 
  updateBlock: (blockId: string, property: string, value: any) => void; 
}