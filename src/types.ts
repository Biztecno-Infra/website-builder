import { BlockType } from "email-builder-utils";
import { ScreenViews } from "enum";
export interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type TextAlign = "left" | "center" | "right" | "justify";
export type VerticalAlign = "top" | "middle" | "bottom";

interface ICoreBlock {
  id: string;
  type: BlockType;
  parentId?: string | null;
  childBlocks: Array<string>;
  layerName?: string;
  hideOnDesktop?: boolean;
  hideOnMobile?: boolean;
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
  width: number;
}

export interface VDividerProps extends BaseBlock {
  width: number;
  height: number;
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
  color?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  lineHeight?: any;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  navigateToUrl?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: string;
  width?: number;
  textContainerPadding?: Padding;
  textContainerBackgroundColor?: string;
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
  color?: string;
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
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  backgroundColor?: any;
  verticalAlign?: VerticalAlign;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: string;
}

export interface GridProps extends BaseBlock {
  rows: number;
  columns: number;
  columnGap: number;
  cellWidths: Array<number>;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  responsive?: boolean;
}

export interface VideoProps extends BaseBlock {
  youtubeVideoUrl?: string;
  videoUrl?: string;
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
  thumbnailUrl?: string;
}

export interface ShapeProps extends BaseBlock {
  width?: number;
  height?: number;
  shapeColor: string;
  shape: "rectangle" | "circle" | "oval" | "rounded";
  borderRadius?: number;
  imageUrl?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: string;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  customCss?: any;
  color?: string;
  textAlign?: TextAlign;
  verticalAlign?: VerticalAlign;
  fontSize?: number;
}

export type Block =
  | TextProps
  | ImageProps
  | ButtonProps
  | GridProps
  | IGridCellProps
  | VideoProps
  | ShapeProps
  | DividerProps
  | VDividerProps
  | SpacerProps;

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
  borderRadius?: number;
  borderColor: string;
  borderWidth?: number;
  borderStyle?: string;
}

export interface RootLayout {
  type: string;
  data: {
    style: GlobalStyles;
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
  setSelectedBlock: (blockId: string | null) => void;
  selectedBlock: Block | RootLayout | null;
  blocks: IBlocksState;
  updateBlock: (blockId: string, property: string, value: any) => void;
  onDeleteBlock: (blockId: string) => void;
  handleJsonUpload: (jsonData: any) => void;
  handleDropper: (
    dragSrc: any,
    dropAreaId: string,
    dropExtraInfo?: any
  ) => void;
  rootBlockOrder: string[];
  globalStyles: GlobalStyles;
  updateGlobalStyles: (styles: GlobalStyles) => void;
  blocksToJson: any;
  selectedView: ScreenViews;
  setSelectedView: any;
  handleImportTemplates: any;
  canvasRef: any;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  undoLocked: boolean;
  setUndoLocked: (locked: boolean) => void;
  handleBlockSwap: (sourceId: any, targetId: any) => void;
  // captureScreenshot: any
}
export interface BlockHookRef {
  getHTML: (json: any) => Promise<string>;
  updateJSON: (data: any) => void;
  getJSON: () => any;
  getScreenShot: () => any;
  importTemplate: (templates: any[]) => void;
  undo: () => void;
  redo: () => void;
  undoLocked: boolean;
  setUndoLocked: (locked: boolean) => void;
  onBrandingSelect: (brands: any[], branding: any) => void;
}

export interface BlockComponentProps {
  blockId: string;
}

export interface GridBlockProps {
  block: Block;
  isSelected: boolean;
}

export interface GridCellProps {
  blockId: string;
  cellWidth: number;
}

interface BaseBlockProps {
  handleDropper: (
    dragSrc: any,
    dropAreaId: string,
    dropExtraInfo?: any
  ) => void;
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

export interface VDividerBlockProps extends BaseBlockProps {
  block: VDividerProps;
}

export interface SpacerBlockProps extends BaseBlockProps {
  block: SpacerProps;
}

export interface ShapeBlockProps extends BaseBlockProps {
  block: ShapeProps;
}

export interface VideoBlockProps extends BaseBlockProps {
  block: VideoProps;
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
  };
  spacing: {
    small: number;
    medium: number;
    large: number;
  };
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
  };
  borderRadius: number;
}
