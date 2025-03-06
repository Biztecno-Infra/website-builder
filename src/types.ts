import { ScreenViews } from "@utils/constant";

export enum BlockType {
  TEXT = "Text",
  IMAGE = "Image",
  BUTTON = "Button",
  GRID = "Columns",
  EMPTY = "EMPTY",
  GRIDCELL = "GridCell",
  SPACER = "Spacer",
  DIVIDER = "Divider"
}

export enum ViewMode {
  Canvas = "canvas",
  Html = "html",
  Json = "json",
}

export interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type TextAlign = "left" | "center" | "right" | "justify";

interface ICoreBlock {
  id: string;
  type: BlockType;
  parentId?: string | null;
  childBlocks: Array<string>;
}


interface BaseBlock extends ICoreBlock {
  text?: string;
  backgroundColor: string;
  alignment: string;
  cellIndex?: number;
  customCss?: any;
}

export interface DividerProps extends BaseBlock {
  thickness: number;
  dividerColor: string;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface SpacerProps extends BaseBlock {
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface TextProps extends BaseBlock {
  textColor?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  backgroundImage?: string;
  lineHeight?: any
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  navigateToUrl?: string;
}

export interface ImageProps extends BaseBlock {
  imageUrl?: string;
  altText?: string;
  width?: number;
  height?: number;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: string;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  navigateToUrl?: string;
}

export interface ButtonProps extends BaseBlock {
  label?: string;
  buttonText?: string;
  navigateToUrl?: string;
  buttonColor?: string;
  textColor?: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: string;
  width: number;
  height: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  buttonPadding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface IGridCellProps extends ICoreBlock {
  // childBlocks: string[];
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  backgroundColor?: any;
  verticalAlignment?: any;
}

export interface GridProps extends BaseBlock {
  rows: number;
  columns: number;
  columnGap: number;
  cellWidths: Array<number>;
  // childBlocks: Array<string>;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: string;
}

export type Block = TextProps | ImageProps | ButtonProps | GridProps | IGridCellProps;

export interface IBlocksState {
  [key: string]: Block;
}

export interface BlockProps {
  block: Block;
  onClick: (block: Block) => void;
}

export interface BlockItemProps {
  type: BlockType;
  name: string;
}

export interface MultiViewContainerProps {

  onBlockClick: (block: Block) => void;
  onDeleteBlock: any;
  globalStyles: GlobalStyles;
}

export interface CanvasProps {
  onBlockClick: (block: Block) => void;
  globalStyles: GlobalStyles;
}

// Interface for Right Panel Props
export interface PropertyPanelProps {
  selectedBlock: TextProps | ImageProps | ButtonProps | GridProps | null;
  updateBlock: (updatedBlock: Block) => void;
  updateGlobalStyles: any;
  globalStyles: GlobalStyles;
}

export interface GlobalStyles {
  canvasColor: string;
  textColor: string;
  fontFamily: string;
  padding: Padding;
}

export interface RootLayout {
  type: string;
  data: {
    style: {
      canvasColor: string;
      textColor: string;
      fontFamily: string;
    };
    childrenIds: string[];
  };
}

export interface BlockData {
  type: string;
  data: {
    props: Record<string, any>;
    style: {
      padding: {
        top: number;
        bottom: number;
        left: number;
        right: number;
      };
      fontWeight?: string;
    };
  };
}

export interface IBlockContext {
  setSelectedBlock: (block: Block | RootLayout | null) => void;
  selectedBlock: Block | RootLayout | null;
  blocks: IBlocksState;
  updateBlock: (blockId: string, property: string, value: any) => void;
  onDeleteBlock: (blockId: string) => void;
  handleJsonUpload: (jsonData: any) => void;
  handleDropper: (dragSrc: any, dropAreaId: string, dropExtraInfo?: any) => void;
  rootBlockOrder: string[];
  globalStyles: GlobalStyles;
  updateGlobalStyles: (styles: GlobalStyles) => void;
  blocksToJson: any;
  convertJsonToHtml: any;
  selectedView: ScreenViews;
  setSelectedView: any;
}
export interface BlockHookRef {
  getHTML: () => string;
  updateJSON: (data: any) => void;
  getJSON: () => any;
}


export interface BlockComponentProps {
  blockId: string;
}

export interface GridBlockProps {
  block: Block;
  isSelected: boolean;
}

export interface GridCellProps {
  blockId: string
  cellWidth: number;
}

interface BaseBlockProps {
  handleDropper: (dragSrc: any, dropAreaId: string, dropExtraInfo?: any) => void;
  handleBlockClick: (e: any) => void;
  isSelected: boolean;
}

// Specific interfaces extending the base interface
export interface TextBlockProps extends BaseBlockProps {
  block: TextProps;
}

export interface ImageBlockProps extends BaseBlockProps {
  block: ImageProps;
}

export interface ButtonBlockProps extends BaseBlockProps {
  block: ButtonProps;
}

export interface DividerBlockProps extends BaseBlockProps {
  block: DividerProps;
}

export interface SpacerBlockProps extends BaseBlockProps {
  block: SpacerProps;
}

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    textPrimary: string;
    textSecondary: string;
    textDefault: string;
    buttonPrimary: string;
    buttonSecondary: string;
    inputColor: string;
    inputPlaceholderColor: string;
  },
  spacing: {
    small: number;
    medium: number;
    large: number;
  },
  elementsPanel: {
    background: string;
    padding: string;
    borderRadius: string;
    textAlign: string;
    border: string;
    marginBottom: string;
    cursor: string;
    width: string;
  };
  canvas: {
    backgroundColor: string;
    canvasColor: string;
    canvasFont: string;
    canvasTextColor: string;
    canvasPadding: string;
    canvasFontSize: string;
  };
  fontSize: {
    labelHeader: string;
    subHeader: string;
  }
  borderRadius: number;
}