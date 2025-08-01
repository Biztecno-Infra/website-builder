import { BlockType } from "email-builder-utils";
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
      layerName: layoutBlock.data.props?.layerName || "",
    };

    switch (block.type) {
      case BlockType.TEXT:
        const textprops = block as TextProps;
        const { textAlign, backgroundColor, lineHeight, ...textStyleRest } =
          layoutBlock.data.style;
        textprops.text = layoutBlock.data.props.text;
        textprops.navigateToUrl = layoutBlock.data.props.navigateToUrl;
        textprops.color = layoutBlock.data.style.color;
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
          buttonprops.borderWidth = buttonBorderWidth;
          buttonprops.borderColor = buttonBorderColor;
          buttonprops.borderStyle = buttonBorderStyle;
        Object.assign(buttonprops, buttonStyleRest);
        break;

      case BlockType.GRID:
        const gridProps = block as GridProps;
        const {
          columnGap = 0,
          ...gridStyleRest
        } = layoutBlock.data.style;
        gridProps.rows = layoutBlock.data.props.rows;
        gridProps.columns = layoutBlock.data.props.columns;
        gridProps.columnGap = columnGap;
        gridProps.cellWidths = layoutBlock.data.props.cellWidths;
        gridProps.customCss = layoutBlock.data.props.customCss
        gridProps.responsive = layoutBlock.data.props.responsive;
        Object.assign(gridProps, gridStyleRest);
        break;

      case BlockType.GRIDCELL:
        const gridCellProp = block as IGridCellProps;
        const {
          padding,
          verticalAlign,
          backgroundColor: cellBackgroundColor,
        } = layoutBlock.data.style || {};
        gridCellProp.padding = padding;
        gridCellProp.verticalAlign = verticalAlign;
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
          customCss
        } = layoutBlock.data.style || {};
        dividerProps.alignment = alignment;
        dividerProps.backgroundColor = dividerbg;
        dividerProps.dividerColor = dividerColor;
        dividerProps.thickness = thickness;
        dividerProps.padding = dividerPadding;
        dividerProps.customCss = customCss || "";
        break;
      case BlockType.SPACER:
        const spacerProps = block as SpacerProps;
        spacerProps.backgroundColor = layoutBlock.data.style.backgroundColor;
        spacerProps.padding = layoutBlock.data.style.padding;
        spacerProps.customCss = layoutBlock.data.style.customCss
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

export const convertStringtoStyle = (cssString: string): React.CSSProperties => {
  const styleObject: Record<string, string | number> = {};  

  // Check if the input string is valid
  if (typeof cssString !== "string" || !cssString.trim()) {
    // console.warn("Invalid CSS string provided:", cssString);
    return styleObject;
  }

  // Clean the CSS string by removing excessive whitespaces and trimming
  const cleanedCssString = cssString.replace(/(\r\n|\n|\r|\s{2,})+/g, " ").trim();

  // Helper function to convert hyphenated CSS property names to camelCase
  const toCamelCase = (str: string) => {
    return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
  };

  // Split the cleaned CSS string by semicolon to extract individual rules
  cleanedCssString.split(";").forEach((rule) => {
    // Skip empty rules (e.g., leading or trailing semicolons)
    if (!rule.trim()) return;

    // Handle background-image URLs separately (React uses 'backgroundImage' for camelCase)
    if (rule.includes("background-image")) {
      const backgroundImageMatch = rule.match(
        /background-image\s*:\s*url\(\s*['"]?(https?:\/\/[^\s)]+)['"]?\s*\)/
      );

      if (backgroundImageMatch) {
        styleObject["backgroundImage"] = `url(${backgroundImageMatch[1]})`;
        return; // Skip further processing for this rule
      }
    }

    // Split the rule into key and value, trimming any whitespace
    const [key, value] = rule.split(":").map((item) => item.trim());

    // Only add valid key-value pairs to the styleObject
    if (key && value) {
      // Convert hyphenated CSS property names to camelCase for React
      const camelCaseKey  = toCamelCase(key);
      styleObject[camelCaseKey] = value;
    }
  });

  return styleObject;
};


// const handleImportTemplates = (templates: any[]) => {
//   try {
//     // Store all the new blocks and the root order that will be appended
//     const newBlocks: IBlocksState = {};
//     const newRootBlockOrder: string[] = [];

//     templates.forEach((template) => {
//       // Convert the template JSON to blocks
//       const { blocks, rootBlock } = jsonToBlocks(template);
//       const { childrenIds, style } = rootBlock.data || {};

//       // Ensure unique IDs for imported blocks
//       Object.keys(blocks).forEach((blockId) => {
//         if (newBlocks[blockId]) {
//           // If the block already exists, generate a new unique ID for it
//           const newId = generateUniqueId();
//           newBlocks[newId] = blocks[blockId];
//           newBlocks[newId].id = newId;
//           delete newBlocks[blockId]; // Remove the old block ID
//         } else {
//           newBlocks[blockId] = blocks[blockId];
//         }
//       });

//       // Append root order from the template to new root order
//       newRootBlockOrder.push(...(childrenIds || []));
//     });

//     // Merge the new blocks and root block order with the existing ones
//     setBlocks((prevBlocks) => ({ ...prevBlocks, ...newBlocks }));
//     setRootBlockOrder((prevRootOrder) => [...prevRootOrder, ...newRootBlockOrder]);

//     return { success: true, message: "Templates imported successfully" };
//   } catch (error) {
//     console.error("Error importing templates:", error);
//     return { success: false, message: "Error importing templates", error };
//   }
// };


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
    border: "1px",
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
