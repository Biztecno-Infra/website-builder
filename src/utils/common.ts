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
