import React, { Fragment, useRef } from "react";
import {EmailBuilder, BlockHookRef} from "email-builder-react";
import "email-builder-react/index.css";

const App = () => {
  const builderRef = useRef<BlockHookRef>(null);

  const getJSON = () => {
    console.log(builderRef.current?.getJSON());
  };

  return (
    <Fragment>
      <EmailBuilder ref={builderRef} />
    </Fragment>
  );
};

export default App;
