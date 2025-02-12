// import React, { useState } from "react";
// import classNames from "classnames";
// import SvgIcon, { SVGType } from "@components/SvgIcon";
// import { IconSizeProp } from "semantic-ui-react/dist/commonjs/elements/Icon/Icon";
// import { Input } from "semantic-ui-react";
// import "./style.scss";

// interface IICONPROPS {
//   svgType: SVGType;
//   circular?: boolean;
//   name: any;
//   size?: IconSizeProp;
//   baseclassname?: any;
//   inverted?: boolean;
// }

// interface IProps {
//   label?: string;
//   labelClassName?: string;
//   baseClassName?: string;
//   onChange?: (name: string, value: any) => void;
//   inputClassName?: string;
//   id: string;
//   placeholder: string;
//   iconProps?: IICONPROPS;
//   disabled?: boolean;
//   onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
//   name: string;
//   value: any;
//   iconRight?: boolean;
//   type?: string;
// }

// export function CustomInput(props: IProps) {
//   const {
//     label,
//     labelClassName,
//     baseClassName,
//     onChange,
//     inputClassName,
//     id,
//     placeholder,
//     iconProps,
//     disabled,
//     onBlur,
//     name,
//     value,
//     iconRight,
//     type,
//   } = props;

//   const [error, setError] = useState<string>("");

//   // Handle input change
//   const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const { value } = event.target;
//     const numericValue = Number(event.target.value);
//     if (type === "number") {

//       if (numericValue < 0) {
//         setError("Value must be greater than or equal to 0");
//         return;
//       }

//       if (name === "columns" && numericValue < 1) {
//         setError("Columns must be 1 or greater");
//         return;
//       } else {
//         setError("");
//       }
//     }


//     // Pass the change to the parent component
//     if (typeof onChange === "function") {
//       onChange(name, type === "number" ? numericValue : value);
//     }
//   };

//   const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
//     if (onBlur) {
//       onBlur(event);
//     }
//   };

//   return (
//     <div
//       className={classNames([
//         "flex flex-column customInput position-relative",
//         baseClassName,
//       ])}
//     >
//       {label && (
//         <div className={classNames(["input-label padding-b-1", labelClassName])}>
//           {label}
//         </div>
//       )}
//       {iconProps && (
//         <SvgIcon
//           {...iconProps}
//           baseclassname={classNames([
//             "input-search",
//             { "input-search-right": iconRight },
//           ])}
//         />
//       )}
//       <Input
//         type={type || "text"}
//         value={value}
//         id={id}
//         name={name}
//         placeholder={placeholder}
//         disabled={disabled}
//         onBlur={handleBlur}
//         onChange={handleInputChange}
//         error={error ? true : false}
//       />
//       {error && <div className="error-message text-3 text-danger-color">{error}</div>}
//     </div>
//   );
// }
// import React, { useState } from "react";
// import styled from "styled-components";
// import SvgIcon, { SVGType } from "@components/SvgIcon";

// const StyledInput = styled.input`
//   padding: 10px;
//   border: 1px solid #ccc;
//   border-radius: 4px;
//   width: 100%;
//   box-sizing: border-box;
//   padding-left: 40px;
// `;

// const StyledLabel = styled.label`
//   display: block;
//   margin-bottom: 5px;
//   font-weight: bold;
// `;

// const StyledContainer = styled.div`
//   position: relative;
//   margin-bottom: 20px;
// `;

// const StyledIcon = styled(SvgIcon)`
//   position: absolute;
//   top: 50%;
//   left: 10px;
//   transform: translateY(-50%);
// `;

// interface CustomInputProps {
//   label: string;
//   value: string;
//   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
//   placeholder?: string;
//   icon?: SVGType;
// }

// const CustomInput: React.FC<CustomInputProps> = ({
//   label,
//   value,
//   onChange,
//   onBlur,
//   placeholder,
//   icon,
// }) => {
//   const [inputValue, setInputValue] = useState(value);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setInputValue(e.target.value);
//     onChange(e);
//   };

//   const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
//     if (onBlur) {
//       onBlur(e);
//     }
//   };

//   return (
//     <StyledContainer>
//       <StyledLabel>{label}</StyledLabel>
//       {icon && <StyledIcon type={icon} />}
//       <StyledInput
//         type="text"
//         value={inputValue}
//         onChange={handleInputChange}
//         onBlur={handleBlur}
//         placeholder={placeholder}
//       />
//     </StyledContainer>
//   );
// };

// export default CustomInput;
import React, { useState } from "react";
import styled from "styled-components";

const InputContainer = styled.div`
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

const StyledInput = styled.input`
  width: 100%;
  height: 2.375rem;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 10px;
  font-family: Arial, sans-serif;
  font-size: 0.75rem;

  &::placeholder {
    color: rgba(191, 191, 191, 0.87);
  }
`;

const ErrorText = styled.div`
  color: red;
  font-size: 0.75rem;
  margin-top: 4px;
`;

interface InputProps {
  label?: string;
  name: string;
  value: string | number;
  placeholder?: string;
  onChange?: (name: string, value: string | number) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  type?: string;
  disabled?: boolean;
}

export function CustomInput({
  label,
  name,
  value,
  placeholder,
  onChange,
  onBlur,
  type = "text",
  disabled = false,
}: InputProps) {
  const [error, setError] = useState<string>("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const numericValue = Number(value);

    if (type === "number" && numericValue < 0) {
      setError("Value must be greater than or equal to 0");
      return;
    }

    setError("");
    if (onChange) onChange(name, type === "number" ? numericValue : value);
  };

  return (
    <InputContainer>
      {label && <Label>{label}</Label>}
      <StyledInput
        type={type}
        value={value}
        name={name}
        placeholder={placeholder}
        onChange={handleInputChange}
        onBlur={onBlur}
        disabled={disabled}
      />
      {error && <ErrorText>{error}</ErrorText>}
    </InputContainer>
  );
}

