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
  responsive?: boolean;
}

interface IBlockData {
  type: BlockType;
  data: {
    props: BlockJsonProps;
    style: any;
    childrenIds?: Array<string>;
  };
}

const addPxToAttributes = [
  "fontSize",
  "lineHeight",
  "borderRadius",
  "borderWidth",
];

const addPxOrPerToAttributes = ["width", "height"];
const allPxAttributes = [...addPxToAttributes, ...addPxOrPerToAttributes];

export const tableCommonStyle = "border-collapse:collapse; table-layout:fixed;";

function cleanJson(obj: any): any {
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(cleanJson);

  return Object.fromEntries(
    Object.entries(obj)
      .filter(
        ([_, value]) => value !== undefined && value !== null && value !== ""
      )
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

function buildStyles(
  style: any,
  { pxChanges, perChanges }: { pxChanges: string[]; perChanges: string[] }
) {
  if (!style) style = {};
  const stylesObj: any = {};

  Object.entries(style).forEach(([key, value]) => {
    if (key === "customCss") return;
    if (value === undefined || value === null || value === "") return;

    if (
      (key === "padding" || key === "buttonPadding") &&
      typeof value === "object"
    ) {
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

  return `${jsonToPlainString(cleanJson(stylesObj))}${
    style.customCss || ""
  }`.trim();
}

export async function convertToHtml(
  blockData: IBlockData,
  rootData: any,
  cellWidthInPx: number
) {
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
  const convertedStyle = buildStyles(rest, {
    perChanges: [],
    pxChanges: allPxAttributes,
  });

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
  const styles = buildStyles(style, {
    perChanges: [],
    pxChanges: allPxAttributes,
  });
  return appendOutlookSupport(``, styles);
}

function convertTextBlock(blockData: IBlockData) {
  const { style, props } = blockData.data;
  const { width, backgroundColor , padding , borderRadius, borderStyle , borderColor, borderWidth, textContainerBackgroundColor , textContainerPadding , ...rest } = style;
  const textBoxStyle = {width, backgroundColor , padding , borderRadius, borderStyle , borderColor, borderWidth}
    const convertedTextStyle = buildStyles(textBoxStyle, {
    perChanges: [],
    pxChanges: allPxAttributes,
  });
  const styles = buildStyles({padding: textContainerPadding , backgroundColor: textContainerBackgroundColor , ...rest}, {
    perChanges: [],
    pxChanges: allPxAttributes,
  });
  const sanitizedText = (props.text ?? "")
    .replaceAll(/<p>/g, "<div>")
    .replaceAll(/<\/p>/g, "</div>");
  const navigateToUrl = props.navigateToUrl || "";
  const convertedTextBox = `<div style="display: inline-block; max-width: 100%; box-sizing: border-box; ${convertedTextStyle}">${sanitizedText.replaceAll(/\n/g, "<br>")}</div>`
  const textContent = appendOutlookSupport(
    convertedTextBox,
    styles
  );

  return navigateToUrl
    ? `<a href="${navigateToUrl}" rel="noreferrer noopener" style="color:inherit; text-decoration:none; cursor:pointer;">${textContent}</a>`
    : textContent;
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
  <v:${
    useRoundRect ? "roundrect" : "rect"
  } xmlns:v="urn:schemas-microsoft-com:vml"
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
    borderColor,
  };

      const image = await Jimp.read(imageUrl);
  const originalWidth = image.bitmap.width;
  const originalHeight = image.bitmap.height;

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

  const imageElement = `<img src="${imageUrl}" alt="${altText}" style="${imageTagStyles}; max-width: ${originalWidth}px; max-height: ${originalHeight}px;" />`;

  const innerContainerWidth =
    ((typeof width === "string" ? parseInt(width.replace("%", "")) : width) /
      100) *
    (cellWidthInPx -
      (style?.padding?.left || 0) -
      (style?.padding?.right || 0));

  const outlookImage = await appendOutlookForImage(
    imageElement,
    cellWidthInPx,
    innerContainerWidth,
    imageUrl,
    style
  );

  const imageContent = appendOutlookSupport(outlookImage, containerStyles);

  return navigateToUrl
    ? `<a href="${navigateToUrl}" target="_blank" rel="noreferrer noopener"  style="display:block; text-decoration:none; cursor:pointer;">${imageContent}</a>`
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
    buttonPadding?: {
      top: number;
      bottom: number;
      right: number;
      left: number;
    };
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
<v:${
    borderRadius ? "roundrect" : "rect"
  } xmlns:v="urn:schemas-microsoft-com:vml" href="${navigateToUrl}"
  style="height:${height}px;v-text-anchor:middle;width:${width}px;"
  arcsize="${borderRadius / height}" ${borderAttributes}
  fillcolor="${buttonColor}">
  <w:anchorlock/>
  <v:textbox inset="${buttonPadding.top}px,${buttonPadding.left}px,${
    buttonPadding.bottom
  }px,${buttonPadding.right}px">
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
  const {
    fontFamily,
    fontSize,
    fontWeight,
    borderColor,
    borderRadius,
    borderWidth,
    borderStyle,
    buttonPadding,
    color,
    buttonColor,
    width,
    height,
    ...rest
  } = style;
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
  const convertedButtonStyle = buildStyles(buttonStyle, {
    perChanges: [],
    pxChanges: allPxAttributes,
  });
  const convertedStyles = buildStyles(    { maxWidth: "100%", boxSizing: "border-box", ...rest },
 {
    perChanges: [],
    pxChanges: allPxAttributes,
  });

  const buttonElement = `<a href="${navigateToUrl}" rel="noreferrer noopener" style="display:inline-block; text-decoration:none; cursor:pointer;"><button style="${convertedButtonStyle}">${text}</button></a>`;
  const buttonContent = appendOutlookSupport(
    appendOutlookForButton(buttonElement, style as any, navigateToUrl, text),
    convertedStyles
  );

  return buttonContent;
}

async function convertGridBlock(
  blockData: IBlockData,
  rootData: any,
  cellWidthInPx: number
) {
  const { style = {}, childrenIds = [], props } = blockData.data;
  const { columns = 1, cellWidths = [], responsive = true } = props;
  const { columnGap = 0, ...restStyle } = style;

  const tableStyles = buildStyles(restStyle, {
    perChanges: [],
    pxChanges: allPxAttributes,
  });

  const total = childrenIds.length;
  const visualRows = Math.ceil(total / columns);

  let html = `
  <!--[if mso]>
  <table border="0" cellpadding="0" cellspacing="${columnGap}" width="100%" style="${tableCommonStyle}">
  <![endif]-->
  <table border="0" cellpadding="0" cellspacing="${columnGap}" width="100%" role="presentation" style="${tableCommonStyle} ${tableStyles}">
  `;

  for (let r = 0; r < visualRows; r++) {
    html += "<tr>";
    for (let c = 0; c < columns; c++) {
      const idx = r * columns + c;
      const childId = childrenIds[idx];
      const widthPercent = cellWidths[c] ?? 100 / columns;

      if (childId) {
        const child = rootData[childId];
        const { style: cellStyle = {} } = child.data || {};
        const verticalAlign = cellStyle.verticalAlign || "top";
        const { html: childHtml, styles } = await convertGridCellBlock(
          child,
          rootData,
          widthPercent,
          cellWidthInPx
        );

        html += `
   <td
    width="${widthPercent}%"
    ${responsive ? 'class="stack-column"' : ""}
    style="vertical-align:${verticalAlign}; padding:0; word-break:break-word; ${styles}"
  >
    ${childHtml}
  </td>`;
      } else {
        html += `<td width="${widthPercent}%" ${
          responsive ? 'class="stack-column"' : ""
        } style="padding:0;"></td>`;
      }
    }
    html += "</tr>";
  }

  html += `</table><!--[if mso]></table><![endif]-->`;
  return html;
}

async function convertGridCellBlock(
  blockData: IBlockData,
  rootData: any,
  cellWidthPercent: number,
  parentCellWidthPx: number
) {
  const { style = {}, childrenIds = [] } = blockData.data;

  const styles = buildStyles(style, {
    perChanges: [],
    pxChanges: allPxAttributes,
  });

  const innerHtmlParts: string[] = [];
  for (const childId of childrenIds) {
    const child = rootData[childId];
    if (child) {
      const cellWidthPx = parentCellWidthPx * (cellWidthPercent / 100);
      innerHtmlParts.push(await convertToHtml(child, rootData, cellWidthPx));
    }
  }

  return {
    html: innerHtmlParts.join(""),
    styles, 
  };
}


export const convertJsonToHtml = async (jsonData: any) => {
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

  const rawHtml = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="x-apple-disable-message-reformatting" />
      <style>
        .responsive-table {
          width: 100%;
          max-width: 600px;
        }
        @media only screen and (max-width: 600px) {
          .responsive-table {
            width: 100% !important;
          }
          .stack-column,
          .stack-column td {
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
          bgcolor="${canvasColor}"
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
