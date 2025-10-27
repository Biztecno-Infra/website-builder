import { ScreenViews } from "enum";

export const getTableStyles = (globalStyles: any) => {
  return {
    margin: "0 auto",
    width: 600,
    maxWidth: 600,
    backgroundColor: globalStyles.canvasColor,
    color: globalStyles.textColor,
    borderCollapse:"collapse",
    tableLayout: "fixed"
  };
};

export function parseBackground(image: string): string {
  const trimmedImage = image?.trim();
  // Check if the image starts with "url(" and ends with ")"
  if (trimmedImage?.startsWith("url(") && trimmedImage?.endsWith(")")) {
    // Remove the "url(" at the start and ")" at the end, and handle extra quotes inside the URL
    let parsedImage = trimmedImage.slice(4, -1).replace(/^['"](.*)['"]$/, '$1');
    // Check for double wrapping and remove if needed
    if (parsedImage.startsWith("url(") && parsedImage.endsWith(")")) {
      parsedImage = parsedImage.slice(4, -1).replace(/^['"](.*)['"]$/, '$1');
    }
    return parsedImage;
  }

  // Return the original string if it's not wrapped in "url()"
  return trimmedImage;
}


export function extractBackgroundUrl(input: string): string {
  const match = input.match(/^url\(["']?(.*?)["']?\)$/);
  return match ? match[1] : input;
}

export const isShallowEqual = (objA: any, objB: any): boolean => {
  if (objA === objB) return true;
  if (!objA || !objB || typeof objA !== 'object' || typeof objB !== 'object') return false;
  
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  
  if (keysA.length !== keysB.length) return false;
  
  return keysA.every(key => objA[key] === objB[key]);
};

export function shouldHideOnCanvas(props: any, selectedView: string): boolean {
  if (!props) return false;
  const { hideOnDesktop, hideOnMobile } = props;
  if (selectedView === ScreenViews.DESKTOP && hideOnDesktop) return true;
  if (selectedView ===  ScreenViews.MOBILE && hideOnMobile) return true;
  return false;
}
