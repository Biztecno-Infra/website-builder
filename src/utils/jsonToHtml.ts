import { Jimp } from "jimp";
import { BlockType } from "email-builder-utils";


interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

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


const addPxToAttributes = ["fontSize", "lineHeight", "borderRadius", "borderWidth"];

const addPxOrPerToAttributes = ["width", "height"];
const allPxAttributes = [...addPxToAttributes, ...addPxOrPerToAttributes];

export const tableCommonStyle = "border-collapse:collapse; table-layout:fixed;";

function cleanJson(obj: any): any {
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(cleanJson);

  return Object.fromEntries(
    Object.entries(obj)
      .filter(([_, value]) => value !== undefined && value !== null && value !== "")
      .map(([key, value]) => [key, cleanJson(value)])
  );
}

function jsonToPlainString(obj: any): string {
  if (typeof obj !== "object" || obj === null) return String(obj);
  if (Array.isArray(obj)) return obj.map(jsonToPlainString).join(", ");

  return Object.entries(obj)
    .map(([key, value]) => `${key}:${jsonToPlainString(value)}; `)
    .join("");
}

function buildStyles(style: any, { pxChanges, perChanges }: { pxChanges: string[]; perChanges: string[] }) {
  if (!style) style = {};
  const stylesObj: any = {};

  Object.entries(style).forEach(([key, value]) => {
    if (key === "customCss") return;
    if (value === undefined || value === null || value === "") return;

    if ((key === "padding" || key === "buttonPadding") && typeof value === "object") {
      const padding = value as Padding;
      value = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
    }

    const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();

    if (pxChanges.includes(key)) {
      stylesObj[cssKey] = typeof value === "number" ? `${value}px` : value;
    } else if (perChanges.includes(key)) {
      stylesObj[cssKey] = typeof value === "number" ? `${value}%` : value;
    } else {
      stylesObj[cssKey] = value;
    }
  });

  return `${jsonToPlainString(cleanJson(stylesObj))}${style.customCss || ""}`.trim();
}

export async function convertToHtml(blockData: IBlockData, rootData: any, cellWidthInPx: number) {
  switch (blockData.type) {
    case BlockType.TEXT:
      return convertTextBlock(blockData);
    case BlockType.IMAGE:
      return await convertImageBlock(blockData, cellWidthInPx);
    case BlockType.BUTTON:
      return convertButtonBlock(blockData);
    case BlockType.GRID:
      return await convertGridBlock(blockData, rootData, cellWidthInPx);
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
  <table width="100%" style="${tableCommonStyle}"><tr><td style="${contentStyle}">${content}</td></tr></table>
  `;
}

// function convertDividerBlockToHtml(blockData: IBlockData) {
//   const { style } = blockData.data;
//   const { thickness, dividerColor, ...rest } = style;
//   const convertedStyle = buildStyles(rest, {perChanges: [], pxChanges: allPxAttributes});
//   return appendOutlookSupport(`<hr style="height:${thickness}px; background-color: ${dividerColor};" />`, convertedStyle);
// }
function convertDividerBlockToHtml(blockData: IBlockData) {
  const { style } = blockData.data;
  const { thickness, dividerColor, ...rest } = style;
  const convertedStyle = buildStyles(rest, { perChanges: [], pxChanges: allPxAttributes });

  const dividerContent = `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td height="${thickness}" style="font-size:1px; line-height:1px; background:${dividerColor};">&nbsp;</td>
      </tr>
    </table>
  `;

  return appendOutlookSupport(dividerContent, convertedStyle);
}


function convertSpacerBlockToHtml(blockData: IBlockData) {
  const { style } = blockData.data;
  const styles = buildStyles(style, { perChanges: [], pxChanges: allPxAttributes });
  return appendOutlookSupport(``, styles);
}

function convertTextBlock(blockData: IBlockData) {
  const { style, props } = blockData.data;
  const styles = buildStyles(style, { perChanges: [], pxChanges: allPxAttributes });
  const text = props.text || "";
  const navigateToUrl = props.navigateToUrl || "";
  const textContent = appendOutlookSupport(text.replaceAll(/\n/g, "<br>"), styles);

  return navigateToUrl ? `<a href="${navigateToUrl}" style="color:inherit; text-decoration:none; cursor:pointer;">${textContent}</a>` : textContent;
}
async function appendOutlookForImage(
  content: string,
  outerContainerWidth: number,
  innerContainerWidth: number,
  imageUrl: string,
  style: any = {}
) {
  const image = await Jimp.read(imageUrl);
  const originalWidth = image.bitmap.width;
  const originalHeight = image.bitmap.height;

  const widthScalingFactor = Math.min(
    outerContainerWidth / originalWidth,
    innerContainerWidth / originalWidth
  );

  const scaledWidth = Math.round(originalWidth * widthScalingFactor);
  const scaledHeight = Math.round(originalHeight * widthScalingFactor);

  const borderWidth = parseInt(style?.borderWidth) || 0;
  const borderColor = style?.borderColor || "transparent";
  const borderRadius = parseInt(style?.borderRadius) || 0;

  const useRoundRect = borderRadius > 0;
  const arcsize = useRoundRect
    ? Math.min(borderRadius / scaledHeight, 1).toFixed(2)
    : "";

  const borderAttributes =
    borderWidth > 0
      ? `strokeweight="${borderWidth}px" strokecolor="${borderColor}"`
      : `stroked="false"`;

  const outlookImage = `<!--[if mso]>
  <v:${useRoundRect ? "roundrect" : "rect"} xmlns:v="urn:schemas-microsoft-com:vml"
    style="width:${scaledWidth}px;height:${scaledHeight}px;"
    ${borderAttributes}
    ${useRoundRect ? `arcsize="${arcsize}"` : ""}
    fill="true" fillcolor="none">
    <v:fill src="${imageUrl}" type="frame" />
    <v:textbox inset="0,0,0,0"><div style="display:none;">.</div></v:textbox>
  </v:${useRoundRect ? "roundrect" : "rect"}>
  <![endif]-->`;

  return `
    ${outlookImage}
    <!--[if !mso]><!-->
      ${content}
    <!--<![endif]-->
  `;
}
async function convertImageBlock(blockData: IBlockData, cellWidthInPx: number) {
  const { style, props } = blockData.data;
  const { altText, imageUrl, navigateToUrl } = props;
  const {
    width,
    height,
    objectFit,
    borderRadius,
    borderWidth,
    borderColor,
    borderStyle,
    ...containerStyle
  } = style;

  // Ensure border styles are applied only to the container, not the image
  const imageStyle = {
    width,
    height,
    objectFit,
    borderStyle,
    borderRadius: borderRadius,
    borderColor
  };

  // Add border styles to container for fallback clients
  const containerStyles = buildStyles(
    {
      ...containerStyle,

    },
    { perChanges: [], pxChanges: addPxToAttributes }
  );

  const imageTagStyles = buildStyles(imageStyle, {
    perChanges: addPxOrPerToAttributes,
    pxChanges: addPxToAttributes,
  });

  const imageElement = `<img src="${imageUrl}" alt="${altText}" style="${imageTagStyles}" />`;

  const innerContainerWidth = ((typeof width === "string" ? parseInt(width.replace("%", "")) : width) / 100) *
    (cellWidthInPx - (style?.padding?.left || 0) - (style?.padding?.right || 0));

  const outlookImage = await appendOutlookForImage(
    imageElement,
    cellWidthInPx,
    innerContainerWidth,
    imageUrl,
    style
  );

  const imageContent = appendOutlookSupport(outlookImage, containerStyles);

  return navigateToUrl
    ? `<a href="${navigateToUrl}" target="_blank" style="display:block; text-decoration:none; cursor:pointer;">${imageContent}</a>`
    : imageContent;
}

function appendOutlookForButton(
  content: string,
  buttonStyle: {
    width?: number;
    height?: number;
    borderRadius?: number;
    borderColor?: string;
    borderWidth?: number;
    buttonColor: string;
    buttonPadding?: { top: number; bottom: number; right: number; left: number };
    color?: string;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number;
    backgroundColor?: string;
  },
  navigateToUrl: string,
  text: string
) {
  const {
    width = 200,
    height = 44,
    borderRadius = 0,
    borderColor = "transparent",
    borderWidth = 0,
    buttonColor = "none",
    buttonPadding = { top: 0, bottom: 0, left: 0, right: 0 },
    color = "#000000",
    fontFamily = "Arial, sans-serif",
    fontSize = 16,
    fontWeight = 400,
  } = buttonStyle;

  const borderAttributes =
    borderWidth > 0
      ? `strokeweight="${borderWidth}px" strokecolor="${borderColor}"`
      : `stroked="false"`;

  return `
<!--[if mso]>
<v:${borderRadius ? "roundrect" : "rect"} xmlns:v="urn:schemas-microsoft-com:vml" href="${navigateToUrl}"
  style="height:${height}px;v-text-anchor:middle;width:${width}px;"
  arcsize="${borderRadius / height}" ${borderAttributes}
  fillcolor="${buttonColor}">
  <w:anchorlock/>
  <v:textbox inset="${buttonPadding.top}px,${buttonPadding.left}px,${buttonPadding.bottom}px,${buttonPadding.right}px">
    <center style="font-family:${fontFamily};font-size:${fontSize}px;font-weight:${fontWeight};color:${color};">
      ${text}
    </center>
  </v:textbox>
</v:${borderRadius ? "roundrect" : "rect"}>
<![endif]-->
<!--[if !mso]><!-->
  ${content}
<!--<![endif]-->
`;
}


function convertButtonBlock(blockData: IBlockData) {
  const { style, props } = blockData.data;
  const { text, navigateToUrl } = props;
  const { fontFamily, fontSize, fontWeight, borderColor, borderRadius, borderWidth, borderStyle, buttonPadding, color, buttonColor, width, height, ...rest } = style;
  const buttonStyle = {
    width,
    height,
    fontFamily,
    fontSize,
    fontWeight,
    borderColor,
    borderRadius,
    borderWidth,
    borderStyle,
    padding: buttonPadding,
    color,
    backgroundColor: buttonColor,
  };
  const convertedButtonStyle = buildStyles(buttonStyle, { perChanges: [], pxChanges: allPxAttributes });
  const convertedStyles = buildStyles(rest, { perChanges: [], pxChanges: allPxAttributes });

  const buttonElement = `<a href="${navigateToUrl}" style="display:inline-block; text-decoration:none; cursor:pointer;"><button style="${convertedButtonStyle}">${text}</button></a>`;
  const buttonContent = appendOutlookSupport(appendOutlookForButton(buttonElement, style as any, navigateToUrl, text), convertedStyles);

  return buttonContent;
}

async function processGridItemsInParallel(columns: any, childrenIds: any, cellWidths: any, cellWidthInPx: number, rootData: any) {
  const gridItemPromises = [];
  for (let colIndex = 0; colIndex < columns; colIndex++) {
    const childId = childrenIds[colIndex];
    const cellWidth = cellWidths ? cellWidths[colIndex] : 100 / columns;
    const childBlockData = rootData[childId];

    if (childBlockData) {
      const gridItemPromise = convertGridCellBlock(childBlockData, rootData, cellWidth, cellWidthInPx);
      gridItemPromises.push(gridItemPromise);
    }
  }
  const gridItems = await Promise.all(gridItemPromises);
  return gridItems;
}

async function convertGridBlock(blockData: IBlockData, rootData: any, cellWidthInPx: number) {
  const { style, childrenIds = [], props } = blockData.data;
  const { columnGap, ...rest } = style;
  const { rows, columns, cellWidths } = props;
  const styles = buildStyles(rest, { perChanges: [], pxChanges: allPxAttributes });
  const gridItems: any[] = await processGridItemsInParallel(columns, childrenIds, cellWidths, cellWidthInPx, rootData);

  return `
    <table cellspacing="${columnGap}" style="width:100%; max-width:100%; ${styles}">
      <tbody>
        <tr>${gridItems.join("")}</tr>
      </tbody>
    </table>
  `;
}

async function convertGridCellBlock(blockData: IBlockData, rootData: any, cellWidth: number, parentCellWidth: number) {
  const { style, childrenIds } = blockData.data;
  const styles = buildStyles(style, { perChanges: [], pxChanges: allPxAttributes });
  const cellItems: string[] = [];

  if (childrenIds && childrenIds?.length > 0) {
    for (const childId of childrenIds) {
      cellItems.push(await convertToHtml(rootData[childId], rootData, parentCellWidth * (cellWidth || 0) / 100));
    }
  }

  return `<td class="stack-column" style="width:${cellWidth}% ; max-width:${cellWidth}%; ${styles}">${cellItems.join("")}</td>`;
}




export const convertJsonToHtml = async (jsonData: any) => {
  console.log(jsonData);
  const rootData = jsonData?.root?.data;
  const blocksHtml = [];
  for (const childId of rootData?.childrenIds) {
    blocksHtml.push(
      await convertToHtml(
        jsonData[childId],
        jsonData,
        600 -
          (rootData.style?.padding?.left || 0) -
          (rootData.style?.padding?.right || 0)
      )
    );
  }
  const {
    fontFamily,
    canvasColor,
    textColor,
    padding = {},
    borderColor,
    borderRadius,
    borderWidth,
    borderStyle,
  } = rootData.style || {};

  const { top = 0, right = 0, bottom = 0, left = 0 } = padding;

  const rawHtml = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Email Layout</title>
      <style>
        .responsive-table {
          width: 100%;
          max-width: 600px;
        }
  
        @media only screen and (max-width: 600px) {
          .stack-column {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      </style>
    </head>
    <body>
      <center>
        <table
          class="responsive-table"
  style="
    font-family: ${fontFamily};
    margin: 0 auto;
    table-layout:fixed;
    background-color: ${canvasColor};
    color: ${textColor};
    padding: ${top}px ${right}px ${bottom}px ${left}px;
    border: ${borderWidth}px ${borderStyle} ${borderColor};
    border-radius: ${borderRadius}px; "
        >
          <tbody>
            <tr>
              <td style="padding: 0;">
                ${blocksHtml.join("")}
              </td>
            </tr>
          </tbody>
        </table>
      </center>
    </body>
  </html>`;

  return rawHtml;
};
