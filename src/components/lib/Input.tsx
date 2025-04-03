import React, { useState } from "react";
import styled from "styled-components";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { SizeEnum } from "enum";

const InputWrapper = styled.div<{ containerStyle?: React.CSSProperties }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  ${(props) => props.containerStyle && { ...props.containerStyle }}
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: #f1f1f1;
  border-radius: 5px;
  padding: 4px;
  position: relative;
`;

const StyledInput = styled.input<{ width: string }>`
  width: ${(props) => props.width};
   height: 30px ;
  line-height: 0;
  border: 1px solid ${({ theme }) => theme.colors.inputColor};
  border-radius: 5px;
  font-family: Arial, sans-serif;
  font-size: 0.75rem;
  padding: 2px 6px;
  box-sizing: border-box;

  &::placeholder {
    color: ${({ theme }) => theme.colors.inputPlaceholderColor};
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type="number"] {
    -moz-appearance: textfield;
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.disabledBg};
    color: ${({ theme }) => theme.colors.disabledText};
    cursor: not-allowed;
  }
`;

const ErrorText = styled.div`
  color: red;
  font-size: 0.75rem;
  margin-top: 4px;
`;

const UnitsLabel = styled.div`
  padding-left: 4px;
  font-size: 0.75rem;
  color: #111111;
  font-weight: 400;
`;

interface InputProps {
  unitsLabel?: string;
  name: string;
  value: any;
  placeholder?: string;
  onChange?: (name: string, value: any) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  type?: string;
  disabled?: boolean;
  containerStyle?: React.CSSProperties;
  iconProps?: {
    name: CUSTOM_SVG_ICON;
    size?: SizeEnum;
  };
  inputStyle?: React.CSSProperties;
  checkLessThanOne?: boolean;
}

export function CustomInput({
  unitsLabel,
  name,
  value,
  placeholder,
  onChange,
  onBlur,
  onKeyDown,
  type = "text",
  disabled = false,
  containerStyle,
  iconProps,
  inputStyle,
  checkLessThanOne = false,
}: InputProps) {
  const [error, setError] = useState<string>("");

  const validateInput = (value: string) => {
    if (value === "") return "Please enter a valid input";
    if (type === "number") {
      const numValue = Number(value);
      if (isNaN(numValue)) return "Please enter a valid number";
      if (numValue < 0) return "Value must be greater than or equal to 0";
      if (numValue < 1 && checkLessThanOne) return "Not less than 1";
    }
    return "";
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const errorMessage = validateInput(value);
    setError(errorMessage);

    if (onChange) onChange(name, type === "number" ? Number(value) : value);
  };

  return (
    <InputWrapper containerStyle={containerStyle}>
      <InputContainer>
        {iconProps && (
          <SvgIcon
            name={iconProps.name}
            size={iconProps.size || SizeEnum.Medium}
            svgStyle={{ width: "35%" }}
          />
        )}
        <StyledInput
          type={type}
          value={value}
          name={name}
          placeholder={placeholder}
          onChange={handleInputChange}
          onBlur={onBlur}
          disabled={disabled}
          onKeyDown={onKeyDown}
          width={unitsLabel || iconProps?.name ? "40%" : "100%"}
          style={inputStyle}
        />
        {unitsLabel && <UnitsLabel>{unitsLabel}</UnitsLabel>}
      </InputContainer>
      {error && <ErrorText>{error}</ErrorText>}
    </InputWrapper>
  );
}
