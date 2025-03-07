import {
  generateButtonBlock,
  generateDividerBlock,
  generateGridBlock,
  generateGridCellBlock,
  generateImageBlock,
  generateSpacerBlock,
  generateTextBlock,
} from "./constant";
import {
  Block,
  ButtonProps,
  IGridCellProps,
  GridProps,
  IBlocksState,
  ImageProps,
  TextProps,
  DividerProps,
  SpacerProps,
  Theme,
} from "../types";
import { BlockType } from "enum";

const generateBlockToJsonData = (block: Block) => {
  let blockData: any;

  switch (block?.type) {
    case BlockType.TEXT:
      blockData = generateTextBlock(block as TextProps);
      break;
    case BlockType.IMAGE:
      blockData = generateImageBlock(block as ImageProps);
      break;
    case BlockType.BUTTON:
      blockData = generateButtonBlock(block as ButtonProps);
      break;
    case BlockType.GRID:
      blockData = generateGridBlock(block as GridProps);
      break;
    case BlockType.GRIDCELL:
      blockData = generateGridCellBlock(block as IGridCellProps);
      break;
    case BlockType.DIVIDER:
      blockData = generateDividerBlock(block as DividerProps);
      break;
    case BlockType.SPACER:
      blockData = generateSpacerBlock(block as SpacerProps);
      break;
    default:
      blockData = null;
  }

  return blockData;
};

export const processBlock = (
  block: Block,
  blocks: IBlocksState,
  layout: any,
  parentId: string | null
) => {
  let blockData = generateBlockToJsonData(block);

  if (blockData) {
    layout[block.id] = blockData;

    if (parentId) {
      if (!layout[parentId].data.childrenIds) {
        layout[parentId].data.childrenIds = [];
      }
      layout[parentId].data.childrenIds.push(block.id);
    }

    if (block.childBlocks && block.childBlocks.length > 0) {
      block.childBlocks.forEach((childBlockId: string) => {
        const childBlock = blocks[childBlockId];
        if (childBlock) {
          processBlock(childBlock, blocks, layout, block.id);
        }
      });
    }
  }
};

export const jsonToBlocks = (
  emailLayoutJson: any
): { blocks: IBlocksState; rootBlock: any } => {
  const blocks: IBlocksState = {};

  const reconstructBlock = (layoutId: string, parentId?: string): Block => {
    const layoutBlock = emailLayoutJson[layoutId];

    if (!layoutBlock) {
      console.error(`Block with ID ${layoutId} not found in the layout.`);
      return {} as Block;
    }
    const block: Block = {
      id: layoutId,
      type: layoutBlock.type,
      parentId: parentId || null,
      childBlocks: [],
    };

    switch (block.type) {
      case BlockType.TEXT:
        const textprops = block as TextProps;
        const { textAlign, backgroundColor, lineHeight, ...textStyleRest } =
          layoutBlock.data.style;
        textprops.text = layoutBlock.data.props.text;
        textprops.navigateToUrl = layoutBlock.data.props.navigateToUrl;
        textprops.textColor = layoutBlock.data.style.color;
        textprops.fontSize = layoutBlock.data.style.fontSize;
        textprops.fontWeight = layoutBlock.data.style.fontWeight;
        textprops.fontFamily = layoutBlock.data.style.fontFamily;
        textprops.alignment = textAlign;
        textprops.backgroundColor = backgroundColor;
        textprops.backgroundImage = layoutBlock.data.props.backgroundImage;
        textprops.lineHeight = lineHeight;
        Object.assign(textprops, textStyleRest);
        break;

      case BlockType.IMAGE:
        const imageprops = block as ImageProps;
        const {
          textAlign: imageTextAlign,
          backgroundColor: imageBackgroundColor,
          width,
          height,
          borderWidth,
          borderRadius,
          borderColor,
          borderStyle,
          ...imageStyleRest
        } = layoutBlock.data.style;
        imageprops.imageUrl = layoutBlock.data.props.imageUrl;
        imageprops.altText = layoutBlock.data.props.altText;
        imageprops.navigateToUrl = layoutBlock.data.props.navigateToUrl;
        imageprops.alignment = imageTextAlign;
        imageprops.width = width;
        imageprops.height = height;
        imageprops.backgroundColor = imageBackgroundColor;
        imageprops.borderRadius = borderRadius;
        if (borderWidth && borderStyle && borderColor) {
          imageprops.borderWidth = borderWidth;
          imageprops.borderColor = borderColor;
          imageprops.borderStyle = borderStyle;
        }
        Object.assign(imageprops, imageStyleRest);
        break;

      case BlockType.BUTTON:
        const buttonprops = block as ButtonProps;
        const {
          textAlign: buttonTextAlign,
          backgroundColor: buttonBackgroundColor,
          borderWidth: buttonBorderWidth,
          borderRadius: buttonBorderRadius,
          borderColor: buttonBorderColor,
          borderStyle: buttonBorderStyle,
          ...buttonStyleRest
        } = layoutBlock.data.style;
        buttonprops.buttonText = layoutBlock.data.props.text;
        buttonprops.navigateToUrl = layoutBlock.data.props.navigateToUrl;
        buttonprops.fontSize = layoutBlock.data.style.fontSize;
        buttonprops.fontWeight = layoutBlock.data.style.fontWeight;
        buttonprops.fontFamily = layoutBlock.data.style.fontFamily;
        buttonprops.alignment = buttonTextAlign;
        buttonprops.backgroundColor = buttonBackgroundColor;
        buttonprops.borderRadius = buttonBorderRadius;
        if (buttonBorderWidth && buttonBorderColor && buttonBorderStyle) {
          buttonprops.borderWidth = buttonBorderWidth;
          buttonprops.borderColor = buttonBorderColor;
          buttonprops.borderStyle = buttonBorderStyle;
        }
        Object.assign(buttonprops, buttonStyleRest);
        break;

      case BlockType.GRID:
        const gridProps = block as any;
        const {
          columnGap = 0,
          verticalAlign,
          ...gridStyleRest
        } = layoutBlock.data.style;
        gridProps.rows = layoutBlock.data.props.rows;
        gridProps.columns = layoutBlock.data.props.columns;
        gridProps.columnGap = columnGap;
        gridProps.cellWidths = layoutBlock.data.props.cellWidths;
        Object.assign(gridProps, gridStyleRest);
        break;

      case BlockType.GRIDCELL:
        const gridCellProp = block as IGridCellProps;
        const {
          padding,
          verticalAlignment,
          backgroundColor: cellBackgroundColor,
        } = layoutBlock.data.style || {};
        gridCellProp.padding = padding;
        gridCellProp.verticalAlignment = verticalAlignment;
        gridCellProp.backgroundColor = cellBackgroundColor;
        break;
      case BlockType.DIVIDER:
        const dividerProps = block as DividerProps;
        const {
          padding: dividerPadding,
          alignment,
          backgroundColor: dividerbg,
          dividerColor,
          thickness,
        } = layoutBlock.data.style || {};
        dividerProps.alignment = alignment;
        dividerProps.backgroundColor = dividerbg;
        dividerProps.dividerColor = dividerColor;
        dividerProps.thickness = thickness;
        dividerProps.padding = dividerPadding;
        break;
      case BlockType.SPACER:
        const spacerProps = block as SpacerProps;
        spacerProps.backgroundColor = layoutBlock.data.style.backgroundColor;
        spacerProps.padding = layoutBlock.data.style.padding;
        break;
      default:
        console.error(`Unknown block type: ${block.type}`);
    }

    if (layoutBlock.data.childrenIds) {
      block.childBlocks = layoutBlock.data.childrenIds.map(
        (childId: string) => {
          const childBlock = reconstructBlock(childId, layoutId);
          blocks[childId] = childBlock;
          return childId;
        }
      );
    }

    return block;
  };

  emailLayoutJson.root.data.childrenIds.forEach((rootChildId: string) => {
    const rootBlock = reconstructBlock(rootChildId);
    blocks[rootChildId] = rootBlock;
  });

  return { blocks, rootBlock: emailLayoutJson.root };
};

export const parseCssString = (cssString: string): Record<string, string> => {
  const styleObject: Record<string, string> = {};
  if (typeof cssString !== "string" || !cssString.trim()) {
    console.warn("Invalid CSS string provided:", cssString);
    return styleObject; 
  }
  const cleanedCssString = cssString?.replace(/(\r\n|\n|\r|\s{2,})+/g, " ") 
    .trim();

  cleanedCssString.split(";").forEach((rule) => {
    if (rule.includes("background-image")) {
      const backgroundImageMatch = rule.match(
        /background-image\s*:\s*url\(\s*['"]?(https?:\/\/[^\s)]+)['"]?\s*\)/
      );

      if (backgroundImageMatch) {
       
        styleObject["background-image"] = `url(${backgroundImageMatch[1]})`;
        return; 
      }
    }

    const [key, value] = rule.split(":").map((item) => item.trim());

    if (key && value) {
      styleObject[key] = value;
    }
  });

  return styleObject;
};

export const defaultTheme: Theme = {
  colors: {
    primary: "#006E75",
    secondary: "#FFFFFF",
    background: "#f8f9fa",
    textPrimary: "#FFFFFF",
    textDefault: "#000000",
    textSecondary: "#212529",
    buttonPrimary: "#0B978E",
    buttonSecondary: "",
    inputColor: "#F1F1F1",
    inputPlaceholderColor: "#8D8D8D",
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
  },
  elementsPanel: {
    background: "white",
    padding: "5px",
    textAlign: "center",
    border: "1px solid #0B978E",
    borderRadius: "10px",
    marginBottom: "10px",
    cursor: "pointer",
    width: "85%",
  },
  fontSize: {
    labelHeader: "0.875rem",
    subHeader: "1rem",
  },
  canvas: {
    canvasColor: "#FFFFFF",
    backgroundColor: "#F1F1F1",
    canvasFont: "Montserrat",
    canvasFontSize: "1rem",
    canvasPadding: "0px",
    canvasTextColor: "#000000",
  },
  borderRadius: 10,
};
