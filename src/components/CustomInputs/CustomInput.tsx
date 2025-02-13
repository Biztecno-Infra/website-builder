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
  onChange?: (name: string, value: any) => void;
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

