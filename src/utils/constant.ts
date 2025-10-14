import { BlockType } from "email-builder-utils";
import {
  ButtonProps,
  DividerProps,
  GlobalStyles,
  GridProps,
  IGridCellProps,
  ImageProps,
  ShapeProps,
  SpacerProps,
  TextProps,
  VideoProps,
} from "../types";

export const defaultTextColor: string = "";
export const defaultPlaceholderImage: string =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQNJgVPk88H7N4njkQXBGIBomyJly6uSngxQ&s";
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

export const defaultFont = "Modern Sans";
export const defaultBg = "";
export const initialGlobalStyle: GlobalStyles = {
  canvasColor: "#FFFFFF",
  textColor: defaultTextColor,
  fontFamily: defaultFont,
  padding: defaultPadding,
  borderColor: "",
  borderRadius: 0,
  borderWidth: 0,
  borderStyle: "none",
};

export const getDefaultBlockProperties = (blockType: BlockType) => {
  if (blockType === BlockType.GRID) {
    return {
      rows: 1,
      columns: 2,
      columnGap: 0,
      cellWidths: [50, 50],
      childBlocks: [],
      borderWidth: 0,
      borderStyle: "none",
      borderColor: "",
      borderRadius: 0,
      backgroundColor: defaultBg,
      backgroundImage: "",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      responsive: true,
    };
  } else if (blockType === BlockType.IMAGE) {
    return {
      imageUrl: defaultPlaceholderImage,
      altText: "Block Image",
      alignment: "left",
      padding: defaultPadding,
      navigateToUrl: "",
      width: 100,
      height: "",
      borderWidth: 0,
      borderStyle: "none",
      borderColor: "",
      borderRadius: 0,
      backgroundColor: defaultBg,
    };
  } else if (blockType === BlockType.TEXT) {
    return {
      text: "Text Block",
      color: defaultTextColor,
      fontSize: 16,
      fontWeight: "400",
      padding: defaultPadding,
      backgroundColor: defaultBg,
      alignment: "left",
      fontFamily: "",
      navigateToUrl: "",
      lineHeight: 16,
      backgroundImage: "",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      borderWidth: 0,
      borderStyle: "none",
      borderColor: "",
      borderRadius: 0,
      textContainerPadding: defaultGridPadding,
      textContainerBackgroundColor: defaultBg,
      width: 150,
    };
  } else if (blockType === BlockType.BUTTON) {
    return {
      buttonText: "Add More Text",
      buttonColor: "#F5F5F5",
      color: defaultTextColor,
      padding: defaultPadding,
      navigateToUrl: "",
      fontFamily: "",
      fontSize: 16,
      fontWeight: "400",
      alignment: "left",
      buttonPadding: defaultGridPadding,
      width: 150,
      height: 50,
      borderWidth: 0,
      borderStyle: "none",
      borderColor: "",
      borderRadius: 0,
      backgroundColor: defaultBg,
    };
  } else if (blockType === BlockType.GRIDCELL) {
    return {
      childBlocks: [],
      padding: defaultGridPadding,
      verticalAlign: "middle",
      backgroundColor: defaultBg,
      backgroundImage: "",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      borderWidth: 0,
      borderStyle: "none",
      borderColor: "",
      borderRadius: 0,
    };
  } else if (blockType === BlockType.DIVIDER) {
    return {
      thickness: 2,
      padding: defaultPadding,
      alignment: "left",
      dividerColor: "#808080",
      backgroundColor: defaultBg,
    };
  } else if (blockType === BlockType.SPACER) {
    return {
      padding: defaultPadding,
      backgroundColor: defaultBg,
    };
  } else if (blockType === BlockType.VIDEO) {
    return {
      padding: defaultPadding,
      backgroundColor: defaultBg,
      videoUrl: "",
      thumbnailUrl: "",
      width: 100,
      height: 100,
      alignment: "center",
      borderWidth: 0,
      borderStyle: "none",
      borderColor: "",
      borderRadius: 0,
    };
  } else if (blockType === BlockType.SHAPE) {
    return {
      padding: defaultPadding,
      backgroundColor: defaultBg,
      shape: "rectangle",
      text: "",
      color: "#000000",
      imageUrl: "",
      width: 150,
      height: 200,
      borderWidth: 0,
      borderStyle: "none",
      borderColor: "",
      borderRadius: 0,
      shapeColor: "#BEBEBE",
      alignment: "left",
      verticalAlign: "middle",
      fontSize: 16,
    };
  } else {
    return {};
  }
};

export const generateTextBlock = (block: TextProps) => {
  const {
    fontWeight,
    color,
    fontFamily,
    fontSize,
    lineHeight,
    padding,
    backgroundColor,
    alignment,
    backgroundImage,
    text,
    navigateToUrl,
    id,
    parentId,
    childBlocks,
    type,
    cellIndex,
    customCss,
    backgroundPosition,
    backgroundRepeat,
    backgroundSize,
    ...rest
  } = block;

  const backgroundImageStyle = backgroundImage
    ? {
        backgroundImage: backgroundImage.startsWith("url")
          ? backgroundImage
          : `url(${backgroundImage})`,
        backgroundPosition: backgroundPosition,
        backgroundRepeat: backgroundRepeat,
        backgroundSize: backgroundSize,
      }
    : {};

  const textStyle: any = {
    fontWeight,
    color,
    fontFamily,
    fontSize,
    lineHeight,
    wordBreak: "break-word",
    whiteSpace: "pre-wrap",
    padding,
    backgroundColor,
    textAlign: alignment,
    customCss,
    ...backgroundImageStyle,
    ...rest,
  };

  return {
    type: block.type,
    layerName: block.layerName || "",
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
    id,
    parentId,
    childBlocks,
    type,
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
    customCss,
    ...rest,
  };

  return {
    type: block.type,
    layerName: block.layerName || "",
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
    color,
    buttonColor,
    buttonText,
    navigateToUrl,
    id,
    parentId,
    childBlocks,
    type,
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
    color,
    buttonColor,
    padding,
    customCss,
    ...rest,
  };
  return {
    type: block.type,
    layerName: block.layerName || "",
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
    customCss,
    backgroundImage,
    backgroundPosition,
    backgroundRepeat,
    backgroundSize,
    responsive,
    ...rest
  } = block || {};

  const backgroundImageStyle = backgroundImage
    ? {
        backgroundImage: backgroundImage.startsWith("url")
          ? backgroundImage
          : `url(${backgroundImage})`,
        backgroundPosition: backgroundPosition,
        backgroundRepeat: backgroundRepeat,
        backgroundSize: backgroundSize,
      }
    : {};

  const gridStyle = {
    columnGap: columnGap || 0,
    backgroundColor,
    ...backgroundImageStyle,
    customCss,
    ...rest,
  };

  return {
    type: block.type,
    layerName: block.layerName || "",

    data: {
      style: gridStyle,
      props: {
        rows: rows || 1,
        columns: columns || 2,
        cellWidths: cellWidths || [50, 50],
        responsive,
      },
    },
  };
};

export const generateGridCellBlock = (block: IGridCellProps) => {
  const {
    layerName,
    childBlocks,
    id,
    type,
    backgroundColor,
    padding,
    parentId,
    verticalAlign,
    backgroundImage,
    backgroundPosition,
    backgroundRepeat,
    backgroundSize,
    ...rest
  } = block || {};

  const backgroundImageStyle = backgroundImage
    ? {
        backgroundImage: backgroundImage.startsWith("url")
          ? backgroundImage
          : `url(${backgroundImage})`,
        backgroundPosition: backgroundPosition,
        backgroundRepeat: backgroundRepeat,
        backgroundSize: backgroundSize,
      }
    : {};

  return {
    type: type,
    layerName: layerName || "",
    data: {
      style: {
        padding: padding,
        backgroundColor: backgroundColor,
        verticalAlign: verticalAlign,
        ...backgroundImageStyle,
        ...rest,
      },
    },
  };
};

export const generateDividerBlock = (block: DividerProps) => {
  const {
    alignment,
    backgroundColor,
    dividerColor,
    padding,
    thickness,
    type,
    customCss,
  } = block || {};

  return {
    type: type,
    layerName: block.layerName || "",

    data: {
      style: {
        padding,
        backgroundColor,
        thickness,
        dividerColor,
        alignment,
        customCss,
      },
    },
  };
};

export const generateSpacerBlock = (block: SpacerProps) => {
  const { alignment, backgroundColor, padding, type, customCss } = block || {};
  return {
    type: type,
    layerName: block.layerName || "",
    data: {
      style: {
        padding,
        backgroundColor,
        alignment,
        customCss,
      },
    },
  };
};

export const generateVideoBlock = (block: VideoProps) => {
  const {
    videoUrl,
    youtubeVideoUrl,
    thumbnailUrl,
    width,
    height,
    alignment,
    padding,
    backgroundColor,
    borderWidth,
    borderStyle,
    borderColor,
    borderRadius,
    customCss,
    id,
    type,
    parentId,
    layerName,
    ...rest
  } = block || {};

  const videoStyle = {
    width,
    height,
    padding,
    backgroundColor,
    textAlign: alignment,
    borderWidth,
    borderStyle,
    borderColor,
    borderRadius,
    customCss,
    ...rest,
  };

  return {
    type: type,
    layerName: layerName || "",
    data: {
      style: videoStyle,
      props: {
        videoUrl,
        youtubeVideoUrl,
        thumbnailUrl,
      },
    },
  };
};

export const generateShapeBlockData = (block: ShapeProps) => {
  const {
    shape,
    text,
    color,
    imageUrl,
    width,
    height,
    padding,
    backgroundColor,
    borderWidth,
    borderStyle,
    borderColor,
    borderRadius,
    customCss,
    layerName,
    type,
    shapeColor,
    alignment,
    fontSize, 
    verticalAlign = "center",
  } = block as ShapeProps || {};

  const style = {
    width,
    height,
    padding,
    backgroundColor,
    borderWidth,
    borderStyle,
    borderColor,
    borderRadius,
    customCss,
    shapeColor,
    color,
    alignment,
     fontSize , verticalAlign
  };

  return {
    type,
    layerName: layerName || "",
    data: {
      style,
      props: {
        shape,
        text,
        imageUrl,
      },
    },
  };
};

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
