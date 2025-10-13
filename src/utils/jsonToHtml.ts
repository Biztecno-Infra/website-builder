import {
  extractYouTubeId,
  extractVimeoId,
} from "@containers/BlockComponent/VideoBlock";
import { Jimp } from "jimp";
import { BlockType } from "email-builder-utils";
import { extractBackgroundUrl } from "./common";
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
  console.log("Converting block to HTML:", blockData);
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
    case BlockType.VIDEO:
      return convertVideoBlock(blockData, cellWidthInPx);
    case BlockType.SHAPE:
      return await convertShapeBlock(blockData , cellWidthInPx);
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
  const {
    width,
    backgroundColor,
    padding,
    borderRadius,
    borderStyle,
    borderColor,
    borderWidth,
    textContainerBackgroundColor,
    textContainerPadding,
    ...rest
  } = style;

  // Inner text box (border + padding + inner background)
  const textBoxStyle = {
    width,
    backgroundColor,
    padding,
    borderRadius,
    borderStyle,
    borderColor,
    borderWidth,
  };
  const convertedTextStyle = buildStyles(textBoxStyle, {
    perChanges: [],
    pxChanges: allPxAttributes,
  });
  const styles = buildStyles(
    {
      padding: textContainerPadding,
      backgroundColor: textContainerBackgroundColor,
      ...rest,
    },
    {
      perChanges: [],
      pxChanges: allPxAttributes,
    }
  );
  const sanitizedText = (props.text ?? "")
    .replaceAll(/<p>/g, "<div>")
    .replaceAll(/<\/p>/g, "</div>");
  const navigateToUrl = props.navigateToUrl || "";
  const convertedTextBox = `<div style="display: inline-block; max-width: 100%; box-sizing: border-box; ${convertedTextStyle}">${sanitizedText.replaceAll(
    /\n/g,
    "<br>"
  )}</div>`;
  const textContent = appendOutlookSupport(convertedTextBox, styles);

  return navigateToUrl
    ? `<a href="${navigateToUrl}" rel="noreferrer noopener" style="color:inherit; text-decoration:none; cursor:pointer;">${textContent}</a>`
    : textContent;
}

// --- improved appendOutlookForImage ---
// Adds support for making the VML element clickable via href (for Outlook).
async function appendOutlookForImage(
  content: string,
  outerContainerWidth: number,
  innerContainerWidth: number,
  imageUrl: string,
  style: any = {},
  href?: string // optional href to make VML clickable
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
    ? Math.min(borderRadius / Math.max(scaledHeight, 1), 1).toFixed(2)
    : "";

  const borderAttributes =
    borderWidth > 0
      ? `strokeweight="${borderWidth}px" strokecolor="${borderColor}"`
      : `stroked="false"`;

  // Add href to VML element so it's clickable in Outlook
  const hrefAttr = href ? `href="${href}"` : "";

  const vmlTagName = useRoundRect ? "roundrect" : "rect";

  const outlookImage = `<!--[if mso]><v:${vmlTagName} xmlns:v="urn:schemas-microsoft-com:vml"
    style="width:${scaledWidth}px;height:${scaledHeight}px;"
    ${hrefAttr}
    ${borderAttributes}
    ${useRoundRect ? `arcsize="${arcsize}"` : ""}
    fill="true">
      <v:fill type="frame" src="${imageUrl}" />
      <v:textbox inset="0,0,0,0"><div style="display:none;">.</div></v:textbox>
  </v:${vmlTagName}><![endif]-->`;

  // non-MSO clients will get the given content (which can be the <a><img/></a> markup)
  return `
    ${outlookImage}
    <!--[if !mso]><!-->
      ${content}
    <!--<![endif]-->
  `;
}

// Shared helper: compute scaled dimensions without upscaling
async function computeScaledDimensions(
  imageUrl: string,
  maxContainerWidthPx: number
) {
  const image = await Jimp.read(imageUrl);
  const originalWidth = image.bitmap.width;
  const originalHeight = image.bitmap.height;

  const widthScalingFactor = Math.min(maxContainerWidthPx / originalWidth, 1);
  const scaledWidth = Math.round(originalWidth * widthScalingFactor);
  const scaledHeight = Math.round(originalHeight * widthScalingFactor);

  return { originalWidth, originalHeight, scaledWidth, scaledHeight };
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

  const innerContainerWidth =
    (((typeof width === "string" ? parseInt(width.replace("%", "")) : width) ||
      100) /
      100) *
    (cellWidthInPx -
      (style?.padding?.left || 0) -
      (style?.padding?.right || 0));

  const { originalWidth, originalHeight, scaledWidth, scaledHeight } =
    await computeScaledDimensions(imageUrl, innerContainerWidth);

  const imageElement = `<img src="${imageUrl}" alt="${altText}" width="${scaledWidth}" height="${scaledHeight}" style="${imageTagStyles}; width:100%; height:auto; max-width:${originalWidth}px; max-height:${originalHeight}px;" />`;

  const percentWidth =
    typeof width === "string" && width.endsWith("%")
      ? width
      : typeof width === "number"
      ? `${width}%`
      : "100%";

  const nonMsoWrapper = `<div style="display:inline-block; width:${percentWidth}; max-width:${originalWidth}px;">${imageElement}</div>`;

  const outlookImage = await appendOutlookForImage(
    nonMsoWrapper,
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
  const convertedStyles = buildStyles(
    { maxWidth: "100%", boxSizing: "border-box", ...rest },
    {
      perChanges: [],
      pxChanges: allPxAttributes,
    }
  );

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
  <table border="0" cellpadding="0" cellspacing="${columnGap}" width="100%" style="${tableCommonStyle}border-collapse: separate;border-spacing:${columnGap}px;">
  <![endif]-->
  <table border="0" cellpadding="0" cellspacing="${columnGap}" width="100%" role="presentation" style="${tableCommonStyle} ${tableStyles}border-collapse: separate;border-spacing:${columnGap}px;">
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
    style="vertical-align:${verticalAlign}; word-break:break-word; ${styles} "
  >
    ${childHtml}
  </td>`;
      } else {
        html += `<td width="${widthPercent}%" ${
          responsive ? 'class="stack-column"' : ""
        } style=""></td>`;
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

// Enhanced Shape Block HTML Conversion
// Enhanced Shape Block HTML Conversion with full email client support
// Enhanced Shape Block HTML Conversion using appendOutlookForShape
// ---------- helpers ----------
function computeArcSize(borderRadius: string | number | undefined, widthPx: number) {
  if (!borderRadius) return "0";
  if (typeof borderRadius === "number") return Math.min(borderRadius / widthPx, 1).toFixed(2);
  const s = borderRadius.toString().trim();
  if (s.endsWith("%")) {
    const pct = parseFloat(s.replace("%", "")) || 0;
    return Math.min(pct / 100, 1).toFixed(2);
  }
  // assume px or raw number
  const px = parseFloat(s.replace("px", "")) || 0;
  return Math.min(px / widthPx, 1).toFixed(2);
}

// ---------- Outlook (MSO) wrapper ----------
async function appendOutlookForShape(
  content: string,
  outerContainerWidth: number,
  innerContainerWidth: number,
  opts: {
    shape: string;
    imageUrl?: string;
    backgroundColor?: string;
    shapeColor?: string;
    borderWidth?: number;
    borderColor?: string;
    borderRadius?: string | number;
    heightPx: number;
    text?: string;
    textColor?: string;
    alignment?: string;
    padding?: any;
    // optional: pre-baked image (image already contains the overlay text) for MSO
    msoBakeImageWithText?: string;
  }
) {
  // Use the inner container width for VML sizing (exact user dims)
  const widthPx = Math.round(Math.min(outerContainerWidth, innerContainerWidth));
  const heightPx = Math.max(1, Math.round(opts.heightPx));

  const vml = buildVMLShape({
    shape: opts.shape,
    widthPx,
    heightPx,
    imageUrl: opts.msoBakeImageWithText || opts.imageUrl,
    backgroundColor: opts.shapeColor || opts.backgroundColor,
    borderWidth: opts.borderWidth,
    borderColor: opts.borderColor,
    borderRadius: opts.borderRadius,
    text: opts.text,
    textColor: opts.textColor,
    // pass raw flag so buildVMLShape knows if image already has text baked-in
    msoHasBakedText: Boolean(opts.msoBakeImageWithText),
  });

  const outlookAlignment = opts.alignment === "center" ? "center" :
                          opts.alignment === "right" ? "right" : "left";

  // Wrap the VML inside a table so Outlook aligns it correctly
  return `<!--[if mso]>
  <table align="${outlookAlignment}" border="0" cellpadding="0" cellspacing="0" style="display:inline-block;">
    <tr>
      <td style="padding:${opts.padding?.top || 0}px ${opts.padding?.right || 0}px ${opts.padding?.bottom || 0}px ${opts.padding?.left || 0}px;">
        ${vml}
      </td>
    </tr>
  </table>
  <![endif]-->`;
}

// ---------- VML builder (produces shape + text inside it for MSO) ----------
function buildVMLShape({
  shape,
  widthPx,
  heightPx,
  imageUrl,
  backgroundColor,
  borderWidth,
  borderColor,
  borderRadius,
  text,
  textColor,
  msoHasBakedText = false,
}: {
  shape: string;
  widthPx: number;
  heightPx: number;
  imageUrl?: string;
  backgroundColor?: string;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: string | number;
  text?: string;
  textColor?: string;
  msoHasBakedText?: boolean;
}) {
  const bw = borderWidth || 0;
  const bc = borderColor || "transparent";
  const hasBorder = bw > 0;
  const borderAttributes = hasBorder ? `strokeweight="${bw}px" strokecolor="${bc}"` : `stroked="false"`;
  
  console.log("Building VML shape:", { shape, widthPx, heightPx, imageUrl, backgroundColor, borderWidth, borderColor, borderRadius, text, textColor, msoHasBakedText });
  const fillColor = backgroundColor || "#2F80ED";

  // Special handling for oval/circle shapes
  let tag = "rect";
  let extraAttr = "";
  
  if (shape === "circle" || shape === "oval") {
    tag = "oval"; // Use oval tag for perfect ellipse/circle
    // For oval, don't use arcsize - it's handled by the oval tag itself
    extraAttr = "";
  } else if (shape === "rounded" || (borderRadius && borderRadius !== "0")) {
    tag = "roundrect";
    extraAttr = ` arcsize="${computeArcSize(borderRadius, widthPx)}"`;
  }

  // image fill (if provided)
  const fillMarkup = imageUrl
    ? `<v:fill src="${imageUrl}" type="frame" aspect="atleast" />`
    : "";

  // If MSO is given a baked image with text, don't produce a v:textbox overlay text (image already contains text)
  const includeTextbox = !!text && !msoHasBakedText;

  // v:textbox: use a table + cell to center the text; avoids many Word quirks
  const textboxInner = includeTextbox
    ? `<v:textbox inset="0,0,0,0">
         <center style="width:${widthPx}px;height:${heightPx}px;display:block;">
           <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${widthPx}" height="${heightPx}" style="border-collapse:collapse;">
             <tr>
               <td align="center" valign="middle" style="font-family:Arial, sans-serif;font-size:14px;line-height:1;color:${textColor || "#000"};padding:6px;">
                 ${text}
               </td>
             </tr>
           </table>
         </center>
       </v:textbox>`
    : // keep an empty textbox so shape sizing behaves consistently when no text
      `<v:textbox inset="0,0,0,0"><div style="display:none;">.</div></v:textbox>`;

  // If there is no imageUrl and no textbox content, use fillcolor for background
  const fillAttr = imageUrl ? 'fill="true"' : `fill="true" fillcolor="${fillColor}"`;

  return `
  <v:${tag} xmlns:v="urn:schemas-microsoft-com:vml"
    style="width:${widthPx}px;height:${heightPx}px;v-text-anchor:middle;"
    ${borderAttributes} ${fillAttr}${extraAttr}>
    ${fillMarkup}
    ${textboxInner}
  </v:${tag}>`;
}

// ---------- convertShapeBlock (updated, keeps your structure) ----------
async function convertShapeBlock(blockData: IBlockData, cellWidthInPx: number) {
  const { style, props } = blockData.data;
  const { shape, text, textColor = "#000000", imageUrl } = props as any;

  const {
    width = "100",
    height = "150",
    padding = {},
    backgroundColor = "#2F80ED",
    borderRadius,
    borderWidth = 0,
    borderStyle = "solid",
    borderColor = "transparent",
    customCss,
    shapeColor,
    alignment = "left",
    msoBakeImageWithText
  } = style || {};

  const borderRadiusMap: Record<string, string> = {
    rectangle: "0",
    rounded: "10px",
    circle: "50%",
    oval: "50%", // Keep this for modern browsers
  };
  let resolvedBorderRadius = borderRadius || borderRadiusMap[shape] || "0";

  let resolvedWidthPx =
    typeof width === "number"
      ? width
      : parseInt(width.toString().replace("px", ""), 10) || 100;

  let resolvedHeightPx =
    typeof height === "number"
      ? height
      : parseInt(height.toString().replace("px", ""), 10) || 150;

  // Special handling for different shapes
  if (shape === "circle") {
    // Circle: make it a perfect square with 50% border radius
    const side = Math.min(resolvedWidthPx, resolvedHeightPx);
    resolvedWidthPx = side;
    resolvedHeightPx = side;
    resolvedBorderRadius = "50%";
  } else if (shape === "oval") {
  }

  const finalWidthPx = resolvedWidthPx;
  const finalHeightPx = resolvedHeightPx;

  const alignmentStyles = {
    left: "margin-right:auto;margin-left:0;",
    center: "margin-left:auto;margin-right:auto;",
    right: "margin-left:auto;margin-right:0;",
  };
  const alignmentStyle =
    alignmentStyles[alignment as keyof typeof alignmentStyles] || "";

  const finalBackgroundColor = shapeColor || backgroundColor;

  // --- Modern clients content ---
  let nonMsoContent = "";

  // For modern browsers, use CSS border-radius
  const modernBorderRadius = shape === "oval" ? "50%" : resolvedBorderRadius;

  // Case 1: Image + Text → use background-image
  if (imageUrl && text) {
    nonMsoContent = `
<div style="display:inline-block;width:${finalWidthPx}px;height:${finalHeightPx}px;
  border:${borderWidth}px ${borderStyle} ${borderColor};
  border-radius:${modernBorderRadius};
  background:${finalBackgroundColor} url('${imageUrl}') center/cover no-repeat;
  overflow:hidden;${alignmentStyle}${customCss || ""}">
  <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">
    <div style="color:${textColor};text-align:center;padding:8px;box-sizing:border-box;word-break:break-word;
      border-radius:4px;max-width:90%;">
      ${text}
    </div>
  </div>
</div>`;
  }
  // Case 2: Image only → use <img>
  else if (imageUrl) {
    nonMsoContent = `
<div style="display:inline-block;width:${finalWidthPx}px;height:${finalHeightPx}px;
  border:${borderWidth}px ${borderStyle} ${borderColor};
  border-radius:${modernBorderRadius};
  overflow:hidden;${alignmentStyle}${customCss || ""}">
  <img src="${imageUrl}" alt="${text || "Shape image"}"
       width="${finalWidthPx}" height="${finalHeightPx}"
       style="width:100%;height:100%;object-fit:cover;border-radius:${modernBorderRadius};display:block;" />
</div>`;
  }
  // Case 3: No image → solid background
  else {
    nonMsoContent = `
<div style="display:inline-block;width:${finalWidthPx}px;height:${finalHeightPx}px;
  background:${finalBackgroundColor};
  border:${borderWidth}px ${borderStyle} ${borderColor};
  border-radius:${modernBorderRadius};
  ${alignmentStyle}${customCss || ""}">
  <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;
    color:${textColor};text-align:center;padding:8px;box-sizing:border-box;word-break:break-word;">
    ${text || ""}
  </div>
</div>`;
  }

  // --- Old Outlook (MSO) VML ---
  const outlookContent = await appendOutlookForShape(
    nonMsoContent,
    finalWidthPx,
    finalWidthPx,
    {
      shape,
      imageUrl,
      backgroundColor,
      shapeColor,
      borderWidth,
      borderColor,
      borderRadius: resolvedBorderRadius,
      heightPx: finalHeightPx,
      text,
      textColor,
      alignment,
      padding,
      msoBakeImageWithText
    }
  );

  // Wrap in container table
  const containerTable = `
<table width="100%" style="border-collapse:collapse;table-layout:fixed;">
  <tr>
    <td style="padding:${padding.top || 0}px ${padding.right || 0}px ${padding.bottom || 0}px ${padding.left || 0}px;
      background-color:transparent;text-align:${alignment};">
      ${outlookContent}
      <!--[if !mso]><!-->
      ${nonMsoContent}
      <!--<![endif]-->
    </td>
  </tr>
</table>`;

  return appendOutlookSupport(containerTable, buildStyles(style, {
    perChanges: addPxOrPerToAttributes,
    pxChanges: allPxAttributes,
  }));
}


// Enhanced Video Block HTML Conversion with centered play button
export async function convertVideoBlock(blockData: any, cellWidthInPx: number) {
  const { style, props } = blockData.data;
  const { videoUrl, youtubeVideoUrl, thumbnailUrl, altText } = props;

  const videoLink = youtubeVideoUrl || videoUrl || "#";

  let resolvedThumbnail =
    thumbnailUrl || "https://via.placeholder.com/480x360?text=No+Thumbnail";
  if (youtubeVideoUrl) {
    const youtubeId = extractYouTubeId(youtubeVideoUrl);
    const vimeoId = extractVimeoId(youtubeVideoUrl);
    if (youtubeId) {
      resolvedThumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    } else if (vimeoId) {
      try {
        const res = await fetch(
          `https://vimeo.com/api/v2/video/${vimeoId}.json`
        );
        if (res.ok) {
          const data = await res.json();
          resolvedThumbnail = data?.[0]?.thumbnail_large || resolvedThumbnail;
        }
      } catch (_) {}
    }
  }

  // Determine width logic
  let percentWidth: string;
  if (typeof style?.width === "string" && style.width.trim().endsWith("%")) {
    percentWidth = style.width.trim();
  } else if (typeof style?.width === "number") {
    percentWidth = `${style.width}%`;
  } else {
    percentWidth = "100%";
  }

  const innerContainerWidth =
    (parseFloat(percentWidth) / 100) *
    (cellWidthInPx -
      (style?.padding?.left || 0) -
      (style?.padding?.right || 0));

  const aspectRatio = 16 / 9;
  const calculatedHeight = innerContainerWidth / aspectRatio;

  const outerContainerStyles = buildStyles(
    {
      ...style,
      width: undefined,
      borderColor: undefined,
      borderRadius: undefined,
      borderWidth: undefined,
      borderStyle: undefined,
    },
    {
      perChanges: addPxOrPerToAttributes,
      pxChanges: addPxToAttributes,
    }
  );

  const borderRadius = parseInt(style?.borderRadius) || 0;
  const borderWidth = parseInt(style?.borderWidth) || 0;
  const borderColor = style?.borderColor || "transparent";

  // Play icon size
  const playIconWidth = 65;
  const playIconHeight = 46;

  // VML centering math (for Outlook)
  const vmlLeft = innerContainerWidth / 2 - playIconWidth / 2;
  const vmlTop = calculatedHeight / 2 - playIconHeight / 2;

const videoContent = `
  <!--[if mso]>
  <v:group xmlns:v="urn:schemas-microsoft-com:vml"
    coordsize="${innerContainerWidth},${calculatedHeight}"
    href="${videoLink}"
    style="width:${innerContainerWidth}px;height:${calculatedHeight}px;">
    <v:rect fill="t"  style="position:absolute;width:${innerContainerWidth}px;height:${calculatedHeight}px; stroked="t"
    strokeweight="${borderWidth}px"
    strokecolor="${borderColor}"
    ${borderRadius > 0 ? `arcsize="${Math.min(borderRadius / calculatedHeight, 1).toFixed(2)}"` : ""}
    >
      <v:fill src="${resolvedThumbnail}" type="frame" color="${style?.backgroundColor || "#FFFFFF"}"/>
    </v:rect>
    <v:shape type="#_x0000_t75"
      style="position:absolute;
             left:${vmlLeft.toFixed(1)}px;
             top:${vmlTop.toFixed(1)}px;
             width:${playIconWidth}px;
             height:${playIconHeight}px;"
      alt="Play" href="${videoLink}" title="${altText || "Video"}"
      stroked="f" filled="t">
      <v:imagedata src="https://app-rsrc.getbee.io/public/resources/components/widgetBar/video-content-icon-sets/light/type-01.png" />
    </v:shape>
  </v:group>
  <![endif]-->

  <!--[if !mso]><!-->
  <table
    width="${innerContainerWidth}"
    cellpadding="0"
    cellspacing="0"
    border="0"
    role="presentation"
    align="${style?.textAlign || "left"}"
    style="
      max-width: ${innerContainerWidth}px;
      width: 100%;
      height: ${calculatedHeight}px;
      background-color: ${style?.backgroundColor || "#FFFFFF"};
      background-image: url('${resolvedThumbnail}');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      box-sizing: border-box;
        border: ${borderWidth}px ${style?.borderStyle || "solid"} ${borderColor};
              border-radius: ${borderRadius}px;
    "
  >
    <tr>
      <td style="padding: 0; height: ${calculatedHeight}px; text-align: center; vertical-align: middle;" valign="middle">
        <a href="${videoLink}" target="_blank" style="display:inline-block; border: 0; outline: none; text-decoration: none;">
          <img
            src="https://app-rsrc.getbee.io/public/resources/components/widgetBar/video-content-icon-sets/light/type-01.png"
            width="${playIconWidth}"
            alt="Play"
            style="display: block;
            border: 0;
              outline: none;
              text-decoration: none;
              height: auto;"
          />
        </a>
      </td>
    </tr>
  </table>
  <!--<![endif]-->
`;


const wrapperHtml = `
  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:0; padding:0; border-collapse: collapse;">
    <tr>
      <td align="${style?.textAlign || "left"}" style="padding:0; ${outerContainerStyles}">
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" 
          align="${style?.textAlign || "left"}"
          style="
            margin:0;
            max-width:${cellWidthInPx}px;
            width:${percentWidth};
            border-collapse:collapse;
          ">
          <tr>
            <td align="${style?.textAlign || "left"}" style="text-align:${style?.textAlign || "left"}; padding:0;">
              ${videoContent}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`;


  return wrapperHtml;
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
