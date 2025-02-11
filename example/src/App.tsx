import React, { Fragment, useRef } from "react";
import {EmailBuilder, BlockHookRef, defaultTheme} from "email-builder-react";
import "email-builder-react/index.css";

const App = () => {
  const builderRef = useRef<BlockHookRef>(null);

  const getJSON = () => {
    console.log(builderRef.current?.getJSON());
  };

  return (
    <Fragment>
      <EmailBuilder ref={builderRef} theme={{
        ...defaultTheme,
        borderRadius: 10
      }} />
    </Fragment>
  );
};

export default App;
