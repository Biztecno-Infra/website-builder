import { Block, TextProps, ImageProps, ButtonProps, GridProps, IGridCellProps } from "../../../types";

export interface BlockFormProps {
  selectedBlock: TextProps | ImageProps | ButtonProps | GridProps | IGridCellProps; 
  updateBlock: (blockId: string, property: string, value: any) => void; 
}