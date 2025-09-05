import { Fragment, useRef } from "react";
import { EmailBuilder, BlockHookRef, defaultTheme } from "email-builder-react";
// import "./index.css";

const App = () => {
  const builderRef = useRef<BlockHookRef>(null);

  const getJSON = () => {
    console.log(builderRef.current?.getScreenShot());
  };
  const handleGetScreenshot = async () => {
    const screenshot = await builderRef.current?.getScreenShot(); // Now you can await the result
    if (screenshot) {
      // Handle the screenshot file (e.g., upload or display)
      console.log("Screenshot captured:", screenshot);
    } else {
      console.log("Failed to capture screenshot");
    }
  };

   const copyToClipboard = async (text: any, message: string, isHtml?: boolean) => {
  if (navigator?.clipboard) {
    try {
      if(isHtml) {
        const blob = new Blob([text],{type: "text/html"});
        const clipboard = [new ClipboardItem({'text/html': blob})]
        await navigator.clipboard.write(clipboard);
      } else {
        await navigator.clipboard.writeText(text);
      }
    } catch (error) {
      console.error("Error copying JSON:", error);
    }
  } else {
    // Fallback for unsupported browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
    } catch (error) {
      console.error("Error copying JSON:", error);
    }
    document.body.removeChild(textArea);
  }
};

const handleExport = (format: "JSON" | "HTML", data: any) => {
    if (format === "JSON" && data?.root?.data?.childrenIds?.length) {
      const formattedJSON = JSON.stringify(data, null, 2);
      copyToClipboard(formattedJSON, "Json Copied!");
    } else if (format === "HTML") {
      copyToClipboard(data, "Html Copied!", true);
    }
  };
  return (
    <Fragment>
      <EmailBuilder
        ref={builderRef}
        theme={{
          ...defaultTheme,
          // borderRadius: 10,
        }}
        onExport={handleExport}
        onImport={() => {
          // Implement import logic here if needed
          console.log("Import triggered");
        }}
      />
      {/* <button onClick={handleGetScreenshot}>getHTML</button> */}
    </Fragment>
  );
};

export default App;
