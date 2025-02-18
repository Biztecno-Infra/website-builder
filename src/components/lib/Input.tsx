import React, { useState } from "react";
import styled, { useTheme } from "styled-components";


const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  margin: 10px 0;
`;

const Label = styled.label<{ color: string; fontSize: string }>`
  line-height: 1rem;
  font-weight: 600;
  padding-bottom: 0.5rem;
  color: ${({ color }) => color};
  font-size: ${({ fontSize }) => fontSize};

  @media screen and (min-width: 1919px) {
    font-size: 1rem;
    line-height: 1.25rem;
  }
`;

const StyledInput = styled.input<{ theme: any }>`
  width: 100%;
  height: 1.5rem;
  padding: 5px;
  background-color: #F1F1F1;
  border: 1px solid ${({ theme }) => theme.colors.inputColor};
  border-radius: 5px;
  font-family: Arial, sans-serif;
  font-size: 0.75rem;
  &::placeholder {
    color: ${({ theme }) => theme.colors.inputPlaceholderColor};
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

interface InputProps {
  label?: string;
  name: string;
  value: any;
  placeholder?: string;
  onChange?: (name: string, value: any) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  type?: string;
  disabled?: boolean;
  elements?: any;
}

export function Input({
  label,
  name,
  value,
  placeholder,
  onChange,
  onBlur,
  onKeyDown,
  type = "text",
  disabled = false,
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
    if (onChange) {
      onChange(name, type === "number" ? numericValue : value);
    }
  };

  return (
    <InputContainer>
      {label && (
        <Label color={theme.colors.primary} fontSize={theme.fontSize.labelHeader}>
          {label}
        </Label>
      )}

      <StyledInput
        theme={theme}
        type={type}
        value={value}
        name={name}
        placeholder={placeholder}
        onChange={handleInputChange}
        onBlur={onBlur}
        disabled={disabled}
        onKeyDown={onKeyDown}
      />

      {error && <ErrorText>{error}</ErrorText>}
    </InputContainer>
  );
}
