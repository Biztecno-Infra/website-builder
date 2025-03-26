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
  return (
    <Fragment>
      <EmailBuilder ref={builderRef} theme={{
        ...defaultTheme,
        // borderRadius: 10,
      }}

      onExport= {(format: 'JSON' | 'HTML', data: any) => {
        console.log(data);
      }}

      />
      {/* <button onClick={handleGetScreenshot}>getHTML</button> */}
    </Fragment>
  );
};

export default App;
