// import React, { useState } from "react";
// import styled from "styled-components";

// const DropdownWrapper = styled.div`
//   position: relative;
//   width: 100%;
// `;

// const Selected = styled.div`
//   padding: 10px;
//   background: #f1f1f1;
//   border: 1px solid #ccc;
//   border-radius: 10px;
//   cursor: pointer;
// `;

// const DropdownList = styled.ul<{ isOpen: boolean }>`
//   position: absolute;
//   width: 90%;
//   list-style: none;
//   background: white;
//   padding: 5px;
//   margin: 0;
//   border: 1px solid #ccc;
//   border-radius: 10px;
//   box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
//   display: ${(props) => (props.isOpen ? "block" : "none")};
//   z-index: 10;
//   max-height: 200px;
//   overflow: auto;
// `;

// const DropdownItem = styled.li`
//   padding: 10px;
//   cursor: pointer;
//   &:hover {
//     background: #e0e0e0;
//   }
// `;

// interface DropdownProps {
//   options: { key: string | number; text: string; value: string | number }[];
//   onChange: (value: string | number) => void;
//   initialValue?: string | number;
// }

// export const CustomDropdown: React.FC<DropdownProps> = ({ options, onChange, initialValue }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [selected, setSelected] = useState(initialValue || options[0].value);

//   const handleSelect = (value: string | number) => {
//     setSelected(value);
//     onChange(value);
//     setIsOpen(false);
//   };

//   return (
//     <DropdownWrapper>
//       <Selected onClick={() => setIsOpen(!isOpen)}>
//         {options.find((opt) => opt.value === selected)?.text}
//       </Selected>
//       <DropdownList isOpen={isOpen}>
//         {options.map((option) => (
//           <DropdownItem key={option.key} onClick={() => handleSelect(option.value)}>
//             {option.text}
//           </DropdownItem>
//         ))}
//       </DropdownList>
//     </DropdownWrapper>
//   );
// };

// // export default CustomDropdown;


import React, { useState } from "react";
import styled from "styled-components";

const DropdownWrapper = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 0.5rem;
`;

const StyledInput = styled.input`
  width: 100%;
  height: 1.5rem;
  padding: 5px;
  border-radius: 5px;
  font-family: Arial, sans-serif;
  font-size: 0.75rem;
  background-color: #F1F1F1;
  cursor: pointer;
  border: none;

  &:focus {
    outline: none;
    border-color: #666;
  }
`;

/* Custom Dropdown List */
const OptionsContainer = styled.div<{ show: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  display: ${({ show }) => (show ? "block" : "none")};
  max-height: 150px;
  overflow-y: auto;
  z-index: 100;
`;

const Option = styled.div`
  padding: 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;

  &:hover {
    background-color: #f0f0f0;
  }
`;

interface DropdownOption {
  key: string | number;
  text: string;
  value: string | number;
}

interface DropdownProps {
  name: string;
  options: DropdownOption[];
  onChange?: (name: string, value: string | number) => void;
}

export function CustomDropdown({ name, options, onChange }: DropdownProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    setShowOptions(false);
    if (onChange) onChange(name, value);
  };

  return (
    <DropdownWrapper>
      <StyledInput
        value={selectedValue}
        readOnly
        onClick={() => setShowOptions(!showOptions)}
        placeholder="Select"
      />
      <OptionsContainer show={showOptions}>
        {options.map((option) => (
          <Option key={option.key} onClick={() => handleSelect(option.value.toString())}>
            {option.text}
          </Option>
        ))}
      </OptionsContainer>
    </DropdownWrapper>
  );
}


// import React from "react";
// import styled, { useTheme } from "styled-components";

// const DropdownContainer = styled.div`
//   display: flex;
//   flex-direction: column;
//   position: relative;
//   margin: 10px 0;
// `;

// const Label = styled.label`
//   line-height: 1rem;
//   font-weight: 600;
//   padding-left: 0.25rem;
//   color:  ${(props) => props.color};
//   font-size: ${(props: any) => props.fontSize};
//   @media screen and (min-width: 1919px) {
//     font-size: 1rem;
//     line-height: 1.25rem;
//   }
// `;

// const StyledSelect = styled.select`
//   width: 100%;
//   height: 2.375rem !important;
//   padding: 0.5rem !important;
//   min-height: 2rem !important;
//   border: 1px solid ${(props: any) => props.theme.colors.inputColor}; 
//   border-radius: 10px;
//   font-family: Arial, sans-serif;
//   font-size: 0.75rem;
//   background-color: white;
//   cursor: pointer;
//   appearance: none;

//   &::placeholder {
//     color: rgba(191, 191, 191, 0.87);
//   }
// `;

// const Option = styled.option`
//   font-size: 0.75rem !important;
// `;

// interface DropdownOption {
//   key: string | number;
//   text: string;
//   value: string | number;
// }

// interface DropdownProps {
//   label?: string;
//   onChange?: (name: string, value: string | number) => void;
//   name: string;
//   initialValue?: string | number;
//   placeholder?: string;
//   options: DropdownOption[];
//   disabled?: boolean;
// }

// export function CustomDropdown({
//   label,
//   onChange,
//   name,
//   initialValue = "",
//   placeholder,
//   options,
//   disabled = false,
// }: DropdownProps) {

//   const theme = useTheme();

//   const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
//     if (onChange) {
//       onChange(name, event.target.value);
//     }
//   };

//   return (
//     <DropdownContainer>
//       {/* {label &&
//         <Label
//           color={theme.colors.primary}
//           fontSize={theme.fontSize.labelHeader}>
//           {label}
//         </Label>} */}
//       <StyledSelect theme={theme}
//         name={name} value={initialValue} onChange={handleDropdownChange} disabled={disabled}>
//         {placeholder && <Option value="">{placeholder}</Option>}
//         {options.map((option) => (
//           <Option key={option.key} value={option.value}>
//             {option.text}
//           </Option>
//         ))}
//       </StyledSelect>
//     </DropdownContainer>
//   );
// }
