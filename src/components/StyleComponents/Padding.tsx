import React from "react";
import { Padding } from "types";
import styled from "styled-components";
import { Input } from "@components/lib";

interface PaddingProps {
  padding: Padding;
  onChange: (padding: Padding) => void;
  mainLabel?: string;
}

const PaddingWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const PaddingLabel = styled.label`
  font-size: 1rem;
  margin-bottom: 0.5rem;
`;

export const PaddingInput: React.FC<PaddingProps> = ({ padding, onChange, mainLabel }) => {
  const handlePaddingChange = (side: string, value: number) => {
    onChange({
      ...padding,
      [side]: value,
    });
  };

  return (
    <PaddingWrapper>
      {mainLabel && <PaddingLabel>Button Padding</PaddingLabel>}
      
      <Input
        name="paddingTop"
        label="Padding Top"
        placeholder="Enter padding top"
        value={padding.top}
        onChange={(name, value) => handlePaddingChange("top", parseInt(value, 10))}
        type="number"
        // baseClassName="margin-b-2"
      />
      <Input
        name="paddingRight"
        label="Padding Right"
        placeholder="Enter padding right"
        value={padding.right}
        onChange={(name, value) => handlePaddingChange("right", parseInt(value, 10))}
        type="number"
        // baseClassName="margin-b-2"
      />
      <Input
        name="paddingBottom"
        label="Padding Bottom"
        placeholder="Enter padding bottom"
        value={padding.bottom}
        onChange={(name, value) => handlePaddingChange("bottom", parseInt(value, 10))}
        type="number"
        // baseClassName="margin-b-2"
      />
      <Input
        name="paddingLeft"
        label="Padding Left"
        placeholder="Enter padding left"
        value={padding.left}
        onChange={(name, value) => handlePaddingChange("left", parseInt(value, 10))}
        type="number"
        // baseClassName="margin-b-2"
      />
    </PaddingWrapper>
  );
};



// import React, { useState } from "react";
// import styled from "styled-components";
// import { Input } from "@components/lib";
// import { Padding } from "types";
// import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
// import { SizeEnum } from "@components/SvgIcon/SvgIcon";

// interface PaddingProps {
//   padding: Padding;
//   onChange: (padding: Padding) => void;
//   mainLabel?: string;
// }

// const PaddingWrapper = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   gap: 8px;
// `;

// const ToggleButton = styled.button`
//   background: #f5f5f5;
//   border: none;
//   cursor: pointer;
//   padding: 6px;
//   border-radius: 50%;
//   display: flex;
//   align-items: center;
//   justify-content: center;

//   &:hover {
//     background: #ddd;
//   }

//   svg {
//     font-size: 14px;
//   }
// `;

// const PaddingBox = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   position: relative;
//   border: 2px dashed #888;
//   padding: 16px;
//   border-radius: 6px;
// `;

// const Row = styled.div`
//   display: flex;
//   justify-content: space-between;
//   width: 100%;
// `;

// const SideInput = styled(Input)`
//   width: 40px;
//   text-align: center;
// `;

// export const PaddingInput: React.FC<PaddingProps> = ({ padding, onChange, mainLabel }) => {
//   const [expanded, setExpanded] = useState(false);
  
//   const handlePaddingChange = (side: string, value: number) => {
//     onChange({
//       ...padding,
//       [side]: value,
//     });
//   };

//   return (
//     <PaddingWrapper>
//       {mainLabel && <label>{mainLabel}</label>}
//       <ToggleButton onClick={() => setExpanded(!expanded)}>
//                 <SvgIcon name={CUSTOM_SVG_ICON.PaddingExpand} size={SizeEnum.Small} />
//               </ToggleButton>
//       <PaddingBox>
//         {expanded ? (
//           <>
//             <SideInput
//               name="paddingTop"
//               value={padding.top}
//               onChange={(name, value) => handlePaddingChange("top", parseInt(value, 10))}
//               type="number"
//             />
//             <Row>
//               <SideInput
//                 name="paddingLeft"
//                 value={padding.left}
//                 onChange={(name, value) => handlePaddingChange("left", parseInt(value, 10))}
//                 type="number"
//               />
//               <SideInput
//                 name="paddingRight"
//                 value={padding.right}
//                 onChange={(name, value) => handlePaddingChange("right", parseInt(value, 10))}
//                 type="number"
//               />
//             </Row>
//             <SideInput
//               name="paddingBottom"
//               value={padding.bottom}
//               onChange={(name, value) => handlePaddingChange("bottom", parseInt(value, 10))}
//               type="number"
//             />
//           </>
//         ) : (
//           <Input
//             name="paddingAll"
//             value={padding.top} // Assume uniform padding for collapsed view
//             onChange={(name, value) => {
//               const newPadding = parseInt(value, 10);
//               onChange({ top: newPadding, right: newPadding, bottom: newPadding, left: newPadding });
//             }}
//             type="number"
//           />
//         )}
//       </PaddingBox>
//     </PaddingWrapper>
//   );
// };
