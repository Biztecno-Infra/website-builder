import React, { useState } from "react";
import styled, { useTheme } from "styled-components";

// Define the InputContainer with dynamic styles based on props
const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  /* margin: 10px 0; */
`;

const Label = styled.label`
&.ebr-inputLabel{
  line-height: 1rem;
  font-weight: 600;
  padding-left: 0.25rem;
  color:  ${(props) => props.color};
  font-size: ${(props: any) => props.fontSize};

  @media screen and (min-width: 1919px) {
    font-size: 1rem;
    line-height: 1.25rem;
  }
}
`;

const StyledInput = styled.input`
&.ebr-input{
  width: 100%;
  height: 2.375rem;
  padding: 0.5rem;
  border: 1px solid ${(props: any) => props.theme.colors.inputColor}; 
  border-radius:  ${(props) => props.theme.borderRadius};
  font-family: Arial, sans-serif;
  font-size: 0.75rem;

  &::placeholder {
    color: ${(props) => props.theme.colors.inputPlaceholderColor}; 
  }
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
  onChange?: (name: string, value: any) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  type?: string;
  disabled?: boolean;
  elements: any;
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
  elements,
}: InputProps) {
  const [error, setError] = useState<string>("");
  const theme = useTheme();

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
      {label &&
        <Label
          className="ebr-inputLabel"
          color={theme.colors.primary}
          fontSize={theme.fontSize.labelHeader}>
          {label}
        </Label>}
      <StyledInput
        className="ebr-input"
        theme={theme}
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