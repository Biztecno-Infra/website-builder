export const getDroppableStyles = (globalStyles: any) => {
  return {
    fontFamily: globalStyles.fontFamily,
    backgroundColor: globalStyles.backdropColor,
    height: "100%",
    padding: "1.5rem 0",
    fontSize: "1rem",
    color: "rgb(38, 38, 38)",
    width: "100%",
    overflow: "auto",
  };
};

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


export function generateUniqueId() {
  // Get current timestamp in milliseconds as a base
  const timestamp = Date.now().toString(36); // Convert to base-36 for shorter length

  // Generate a random 5-character string (36^5 possibilities)
  const randomStr = Math.random().toString(36).substring(2, 7);

  // High-resolution timing to add further uniqueness, hashed for brevity
  const perfTimeHash = (performance.now() * 1000 | 0).toString(36);

  return `${timestamp}-${randomStr}-${perfTimeHash}`;
}