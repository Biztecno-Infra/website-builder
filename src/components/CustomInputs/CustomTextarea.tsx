// import React, { useEffect, useState } from "react";
// import classNames from "classnames";
// import { TextArea } from "semantic-ui-react"; // Import TextArea from Semantic UI React

// import "./style.scss";

// interface IProps {
//   label?: string;
//   labelClassName?: string;
//   baseClassName?: string;
//   onChange?: (name: string, value: any) => void;
//   inputClassName?: string;
//   id: string;
//   placeholder: string;
//   onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
//   name: string;
//   initialValue?: any;
//   numberOfrows?: number;
// }

// export function CustomTextArea(props: IProps) {
//   const {
//     label,
//     labelClassName,
//     baseClassName,
//     onChange,
//     inputClassName,
//     id,
//     placeholder,
//     onBlur,
//     name,
//     initialValue,
//     numberOfrows = 4,
//   } = props;

//   const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
//     const { value } = event.target;
//     if (typeof onChange === "function") {
//       onChange(name, value);
//     }
//   };

//   return (
//     <div
//       className={classNames([
//         "flex flex-column customTextArea position-relative margin-1",
//         baseClassName,
//       ])}
//     >
//       {label && (
//         <div
//           className={classNames(["input-label padding-b-1", labelClassName])}
//         >
//           {label}
//         </div>
//       )}
//       <TextArea
//         value={initialValue || ""}
//         id={id}
//         name={name}
//         placeholder={placeholder}
//         rows={numberOfrows}
//         className={classNames("padding-2", inputClassName || "")}
//         onBlur={onBlur}
//         onChange={handleInputChange}
//       />
//     </div>
//   );
// }

import React from "react";
import styled from "styled-components";

const TextAreaContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  margin: 10px 0;
`;

const Label = styled.label`
  font-size: 0.85rem;
  line-height: 1rem;
  font-weight: 600;
  padding-left: 0.25rem;

  @media screen and (min-width: 1919px) {
    font-size: 1rem;
    line-height: 1.25rem;
  }
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 10px;
  font-family: Arial, sans-serif;
  font-size: 0.75rem;
  resize: vertical;
  min-height: 4rem;

  &::placeholder {
    color: rgba(191, 191, 191, 0.87);
  }
`;

interface TextAreaProps {
  label?: string;
  name: string;
  value: string;
  placeholder?: string;
  onChange?: (name: string, value: string) => void;
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  rows?: number;
}

export function CustomTextArea({
  label,
  name,
  value,
  placeholder,
  onChange,
  onBlur,
  rows = 4,
}: TextAreaProps) {
  const handleTextAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) onChange(name, event.target.value);
  };

  return (
    <TextAreaContainer>
      {label && <Label>{label}</Label>}
      <StyledTextArea
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={handleTextAreaChange}
        onBlur={onBlur}
        rows={rows}
      />
    </TextAreaContainer>
  );
}
