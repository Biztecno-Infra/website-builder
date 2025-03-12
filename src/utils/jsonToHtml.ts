import { BlockType } from "enum";
import { Padding } from "../types";
interface BlockJsonProps {
  columns: number;
  rows: number;
  cellWidths: Array<number>;
  navigateToUrl: string;
  text: string;
  altText: string;
  imageUrl: string;
}

interface IBlockData {
  type: BlockType;
  data: {
    props: BlockJsonProps;
    style: any;
    childrenIds?: Array<string>;
  };
}

const addPxToAttributes = ["width", "height", "fontSize" , "lineHeight"];
export const tableCommonStyle = "border-collapse:collapse; table-layout:fixed;";

function cleanJson(obj: any): any {
  if (typeof obj !== "object" || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map(cleanJson);
  }

  return Object.fromEntries(
    Object.entries(obj)
      .filter(
        ([_, value]) => value !== undefined && value !== null && value !== ""
      )
      .map(([key, value]): any => [key, cleanJson(value)])
  );
}

function jsonToPlainString(obj: any): string {
  if (typeof obj !== 'object' || obj === null) return String(obj);

  if (Array.isArray(obj)) {
    return obj.map(jsonToPlainString).join(', ');
  }

  return Object.entries(obj)
    .map(([key, value]) => `${key}:${jsonToPlainString(value)}; `)
    .join('');
}


function buildStyles(style: any) {
  const stylesObj: any = {}
  Object.entries(style).forEach(([key, value]) => {
    const appendPx = addPxToAttributes.includes(key);
    if (value === undefined || value === null || value === "") return null;
    if (
      (key === "padding" || key === "buttonPadding") &&
      typeof value === "object" &&
      value !== null
    ) {
      const padding = value as Padding;
      value = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
    }
    const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();

    return stylesObj[cssKey] = appendPx ? `${value}px` : value;
  });
  return jsonToPlainString(cleanJson(stylesObj)).trim();
}

export function convertToHtml(blockData: IBlockData, rootData: any) {
  switch (blockData.type) {
    case BlockType.TEXT:
      return convertTextBlock(blockData);
    case BlockType.IMAGE:
      return convertImageBlock(blockData);
    case BlockType.BUTTON:
      return convertButtonBlock(blockData);
    case BlockType.GRID:
      return convertGridBlock(blockData, rootData);
    case BlockType.DIVIDER:
      return convertDividerBlockToHtml(blockData);
    case BlockType.SPACER:
      return convertSpacerBlockToHtml(blockData);
    default:
      return "";
  }
}

function appendOutlookSupport(content: string, contentStyle: string) {
  return `
  <table width="100%" style="${tableCommonStyle}">
      <tr>
        <td style="${contentStyle}">
          ${content}
         </td>
      </tr>
    </table>
  `
}

function convertDividerBlockToHtml(blockData: IBlockData) {
  const { style } = blockData.data;
  const { thickness, dividerColor, ...rest } = style;
  const convertedStyle = buildStyles(rest);
  return appendOutlookSupport(`<hr style="height:${thickness}px; background-color: ${dividerColor};" />`, convertedStyle);
}

function convertSpacerBlockToHtml(blockData: IBlockData) {
  const { style } = blockData.data;
  const styles = buildStyles(style);
  return appendOutlookSupport(``, styles);
}

function convertTextBlock(blockData: IBlockData) {
  const { style, props } = blockData.data;
  const styles = buildStyles(style);
  console.log(style , styles)
  const text = props.text || "";
  const navigateToUrl = props.navigateToUrl || "";
  const textContent = appendOutlookSupport(text.replaceAll(/\n/g, '<br>'), styles);

  return navigateToUrl
    ? `<a href="${navigateToUrl}" style="color:inherit; text-decoration:none; cursor:pointer;">${textContent}</a>`
    : textContent;
}

function appendOutlookForImage(content: string, imageStyle: string, imageUrl: string) {
  return `
  <!--[if mso]>
    <v:rect xmlns:v="urn:schemas-microsoft-com:vml"
      fill="t" stroke="f"
      style="${imageStyle}">
      <v:fill src="${imageUrl}" type="frame"/>
    </v:rect>
  <![endif]-->
   <!--[if !mso]><!-->
    ${content}
  <!--<![endif]-->
  `
}

function convertImageBlock(blockData: IBlockData) {
  const { style, props } = blockData.data;
  const { altText, imageUrl, navigateToUrl } = props;
  const { width, height, objectFit, ...containerStyle } = style;
  const imageStyle = { width, height, objectFit };
  const containerStyles = buildStyles(containerStyle);
  const imageTagStyles = buildStyles(imageStyle);

  const imageElement = `<img src="${imageUrl}" alt="${altText}" style="${imageTagStyles}" />`;

  const imageContent = appendOutlookSupport(appendOutlookForImage(imageElement , imageTagStyles, imageUrl), containerStyles);

  return navigateToUrl
    ? `<a href="${navigateToUrl}" target="_blank" style="display:block; text-decoration:none; cursor:pointer;">${imageContent}</a>`
    : imageContent;
}

function appendOutlookForButton(content: string, buttonStyle: {
  width?: number;
  height?: number;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  buttonColor: string;
  buttonPadding?: {top: number, bottom: number, right: number, left: number};
  color?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  backgroundColor?: string
}, navigateToUrl: string, text: string) {
  const {width, buttonColor, borderColor, borderRadius, borderWidth, height, buttonPadding, color, fontFamily, fontSize, fontWeight} = buttonStyle;
  return `
  <!--[if mso]>
    <v:${borderRadius ? "roundrect": "rect"} xmlns:v="urn:schemas-microsoft-com:vml" href="${navigateToUrl}" xmlns:w="urn:schemas-microsoft-com:office:word" style="height:${height || 44}px;width:${width || 200}px;v-text-anchor:middle;" arcsize="${borderRadius || 0}px" strokeweight="${ borderWidth || 1}px" strokecolor="${borderColor || "transparent"}" fillcolor="${buttonColor || "none"}">
    <w:anchorlock/>
    <v:textbox inset="${buttonPadding?.top || 0}px, ${buttonPadding?.left || 0}px, ${buttonPadding?.bottom || 0}px, ${buttonPadding?.right || 0}px">
      <center style="font-family:${fontFamily || ""};font-size:${fontSize}px;font-weight:${fontWeight};color:${color};">${text}</center>
    </v:textbox>
    </v:${borderRadius ? "roundrect": "rect"}>
  <![endif]-->
  <!--[if !mso]><!-->
    ${content}
  <!--<![endif]-->
  `
}

function convertButtonBlock(blockData: IBlockData) {
  const { style, props } = blockData.data;
  const { text, navigateToUrl } = props;
  const {
    fontFamily,
    fontSize,
    fontWeight,
    borderColor,
    borderRadius,
    borderWidth,
    borderStyle,
    buttonPadding,
    textColor,
    buttonColor,
    ...rest
  } = style;
  const buttonStyle = {
    fontFamily,
    fontSize,
    fontWeight,
    borderColor,
    borderRadius,
    borderWidth,
    borderStyle,
    padding: buttonPadding,
    textColor,
    backgroundColor : buttonColor,
  };
  const convertedButtonStyle = buildStyles(buttonStyle);
  const convertedStyles = buildStyles(rest);

  const buttonElement = `<a href="${navigateToUrl}" style="display:inline-block; text-decoration:none; cursor:pointer;"><button style="${convertedButtonStyle}">${text}</button></a>`;
  const buttonContent  = appendOutlookSupport(appendOutlookForButton(buttonElement, style as any, navigateToUrl, text), convertedStyles);

  return buttonContent;
}

function convertGridBlock(blockData: IBlockData, rootData: any) {
  const { style, childrenIds = [], props } = blockData.data;
  const { columnGap, ...rest } = style;
  const { rows, columns, cellWidths } = props;
  const styles = buildStyles(rest);
  const gridItems: any[] = [];

  for (let colIndex = 0; colIndex < columns; colIndex++) {
    const childId = childrenIds[colIndex];
    const cellWidth = cellWidths ? cellWidths[colIndex] : 100 / columns;
    const childBlockData = rootData[childId];
    if(childBlockData) {
      gridItems.push(convertGridCellBlock(childBlockData, rootData, cellWidth));
    }
  }

  return `
    <table cellspacing="${columnGap}" style="width:100%; max-width:100%; ${styles}">
      <tbody>
        <tr>${gridItems.join("")}</tr>
      </tbody>
    </table>
  `;
}

function convertGridCellBlock(
  blockData: IBlockData,
  rootData: any,
  cellWidth: number
) {
  const { style, childrenIds } = blockData.data;
  const styles = buildStyles(style);
  const cellItems =
    childrenIds && childrenIds.length > 0
      ? childrenIds
          .map((childId) => convertToHtml(rootData[childId], rootData))
          .join("")
      : "";

  return `<td style="width:${cellWidth}% ; max-width:${cellWidth}%; ${styles}">${cellItems}</td>`;
}