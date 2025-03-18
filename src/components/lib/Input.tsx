import React, { Fragment, useState } from "react";
import styled from "styled-components";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { SizeEnum } from "enum";

const InputContainer = styled.div`
  display: flex;
  flex-direction: row;
  position: relative;
  width: 100%;
  background-color: #f1f1f1;
  align-items: center;
  border-radius: 5px;

  .ebr-styledInput {
    width: ${({ width }: any) => width || "100%"};
    height: 26px;
    line-height: 0;
    border: 1px solid ${({ theme }) => theme.colors.inputColor};
    border-radius: 5px;
    font-family: Arial, sans-serif;
    font-size: 0.75rem;
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
  elements?: any;
  borderTop?: boolean;
  borderBottom?: boolean;
  borderLeft?: boolean;
  borderRight?: boolean;
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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    if (value === "") {
      setError("Please enter a valid number");
      if (onChange) {
        onChange(name, value);
      }
      return;
    }

    const newValue = type === "number" && value ? Number(value) : value;

    if (type === "number") {
      if (isNaN(newValue as number)) {
        setError("Please enter a valid number");
      } else if ((newValue as number) < 0) {
        setError("Value must be greater than or equal to 0");
      } else if ((newValue as number) < 1 && checkLessThanOne) {
        setError("Not less than 1");
      } else {
        setError("");
      }
    }

    if (onChange) {
      onChange(name, newValue);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%"  , ...containerStyle}}>
      <InputContainer>
        {iconProps && iconProps.name && (
          <SvgIcon
            name={iconProps.name}
            size={iconProps.size || SizeEnum.Medium}
            svgStyle={{ width: "35%" }}
          />
        )}
        <input
          className="ebr-styledInput"
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
        {/* <StyledInput
          theme={theme}
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
        /> */}
        {unitsLabel && <UnitsLabel>{unitsLabel}</UnitsLabel>}
      </InputContainer>
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}
