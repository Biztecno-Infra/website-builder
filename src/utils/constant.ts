import {
  BlockType,
  ButtonProps,
  DividerProps,
  GlobalStyles,
  GridProps,
  IGridCellProps,
  ImageProps,
  SpacerProps,
  TextProps,
} from "../types";

export const defaultTextColor : string = "#000000";
const defaultPlaceholderImage : string = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQNJgVPk88H7N4njkQXBGIBomyJly6uSngxQ&s"
// const defaultPlaceholderImage : string = "https://t4.ftcdn.net/jpg/05/17/53/57/360_F_517535712_q7f9QC9X6TQxWi6xYZZbMmw5cnLMr279.jpg";

export const defaultPadding = {
  top: 10,
  right: 10,
  bottom: 10,
  left: 10,
};

export const defaultTableCell = {
  rows: 1,
  columns: 2,
};

export const defaultGridPadding = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

export const defaultFont = "MODERN_SANS";

export const initialGlobalStyle : GlobalStyles = {
  canvasColor: "#FFFFFF",
  textColor: defaultTextColor,
  fontFamily: "MODERN_SANS",
  padding: defaultPadding
};

export const getDefaultBlockProperties = (blockType: BlockType) => {
  if (blockType === BlockType.GRID) {
    return {
      rows: 1,
      columns: 2,
      columnGap: 0,
      cellWidths: [50, 50],
      childBlocks: [],
      borderWidth:  "", 
      borderStyle: "", 
      borderColor: "", 
      borderRadius : "",
      backgroundColor: ""
    };
  } else if (blockType === BlockType.IMAGE) {
    return {
      imageUrl: defaultPlaceholderImage,
      altText: "Block Image",
      alignment: "left",
      padding: defaultPadding,
      navigateToUrl: "",
      width: "",
      height: "",
      borderWidth:  "", 
      borderStyle: "", 
      borderColor: "", 
      borderRadius : "",
    };
  } else if (blockType === BlockType.TEXT) {
    return {
      text: "Text Block",
      textColor: "",
      fontSize: 16,
      fontWeight: "400",
      padding: defaultPadding,
      backgroundColor: "",
      alignment: "left",
      fontFamily: defaultFont,
      navigateToUrl: "",
      lineHeight: 16,
      backgroundImage: "" 
    };
  } else if (blockType === BlockType.BUTTON) {
    return {
      buttonText: "Add More Text",
      buttonColor: "",
      textColor: "",
      padding: defaultPadding,
      navigateToUrl: "",
      fontFamily: defaultFont,
      fontSize: 16,
      fontWeight: "400",
      alignment: "left",
      buttonPadding: defaultPadding,
      width: 150,
      height: 50,
      borderWidth:  "", 
      borderStyle: "", 
      borderColor: "", 
      borderRadius : "",
    };
  } else if (blockType === BlockType.GRIDCELL) {
    return {
      childBlocks: [],
      padding: defaultGridPadding,
      verticalAlignment: "middle",
      backgroundColor: ""
    };
  } else if (blockType === BlockType.DIVIDER) {
    return {
      thickness: 2,
      padding: defaultPadding,
      backgroundColor: "",
      alignment: "left",
      dividerColor: "#808080",
    };
  } else if (blockType === BlockType.SPACER) {
    return {
      padding: defaultPadding,
      backgroundColor: "",
    };
  } else {
    return {};
  }
};

export const generateTextBlock = (block: TextProps) => {
  const {
    fontWeight,
    textColor,
    fontFamily,
    fontSize,
    lineHeight,
    padding,
    backgroundColor,
    alignment,
    backgroundImage,
    text,
    navigateToUrl,
    id , 
    parentId, 
    childBlocks, 
    type , 
    cellIndex, 
    customCss,
    ...rest
  } = block;

  const textStyle: any = {
    fontWeight,
    color: textColor,
    fontFamily,
    fontSize,
    lineHeight,
    wordBreak: "break-word",
    // whiteSpace: "pre-wrap",
    padding,
    backgroundColor,
    textAlign: alignment,
    ...rest,
  };

  if (backgroundImage) {
    textStyle.backgroundImage = `url('${backgroundImage}')`;
    textStyle.backgroundSize = "cover";
    textStyle.backgroundRepeat = "no-repeat";
    textStyle.backgroundPosition = "center";
  }

  return {
    type: block.type,
    data: {
      style: textStyle,
      props: {
        text: text || "",
        navigateToUrl,
      },
    },
  };
};

export const generateImageBlock = (block: ImageProps) => {
  const {
    padding,
    backgroundColor,
    alignment,
    width,
    height,
    imageUrl,
    altText,
    navigateToUrl,
    id , 
    parentId, 
    childBlocks, 
    type , 
    cellIndex, 
    customCss,
    ...rest
  } = block || {};

  const imageStyle = {
    padding,
    backgroundColor,
    textAlign: alignment,
    width,
    height,
    objectFit: "contain",
    ...rest,
  };

  return {
    type: block.type,
    data: {
      style: imageStyle,
      props: {
        imageUrl,
        altText,
        navigateToUrl,
      },
    },
  };
};

export const generateButtonBlock = (block: ButtonProps) => {
  const {
    padding,
    backgroundColor,
    alignment,
    fontWeight,
    fontFamily,
    fontSize,
    textColor,
    buttonColor,
    buttonText,
    navigateToUrl,
    id , 
    parentId, 
    childBlocks, 
    type , 
    cellIndex, 
    customCss,
    ...rest
  } = block || {};

  const buttonStyle = {
    backgroundColor,
    textAlign: alignment,
    fontWeight,
    fontFamily,
    fontSize,
    color: textColor,
    buttonColor,
    padding,
    ...rest,
  };

  return {
    type: block.type,
    data: {
      style: buttonStyle,
      props: {
        text: buttonText,
        navigateToUrl,
        textAlign: alignment,
      },
    },
  };
};

export const generateGridBlock = (block: GridProps) => {
  const {
    childBlocks,
    alignment,
    cellWidths,
    backgroundColor,
    columnGap,
    columns,
    rows,
    id,
    type,
    parentId,
    customCss , 
    borderWidth,
    ...rest
  } = block || {};

  const gridStyle = {
    columnGap: columnGap || 0,
    backgroundColor,
    ...rest,
  };

  return {
    type: block.type,
    data: {
      style: gridStyle,
      props: {
        rows: rows || 1,
        columns: columns || 2,
        cellWidths: cellWidths || [50, 50],
      },
    },
  };
};

export const generateGridCellBlock = (block: IGridCellProps) => {
  return {
    type: block.type,
    data: {
      style: {
        padding: block.padding,
        backgroundColor: block.backgroundColor,
        verticalAlignment: block.verticalAlignment,
      },
    },
  };
};

export const generateDividerBlock = (block: DividerProps) => {
  const { alignment , backgroundColor , dividerColor , padding , thickness , type} = block || {};
  return {
    type: type,
    data: {
      style: {
        padding,
        backgroundColor,
        thickness,
        dividerColor, 
        alignment
      }
    }
  }
}

export const generateSpacerBlock = (block: SpacerProps) => {
  const { alignment , backgroundColor , padding  , type} = block || {};
  return {
    type: type,
    data: {
      style: {
        padding,
        backgroundColor, 
        alignment
      }
    }
  }
}

export const rgbToHex = (rgb: string): string => {
  const result = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (result) {
    const r = parseInt(result[1], 10);
    const g = parseInt(result[2], 10);
    const b = parseInt(result[3], 10);
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
  }
  return rgb;
};


export enum ScreenViews {
  DESKTOP = "Desktop", 
  MOBILE = "Mobile"
} 