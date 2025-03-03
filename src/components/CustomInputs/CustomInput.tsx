import React, { useState } from "react";
import styled, { useTheme } from "styled-components";

// Extending the LabelHTMLAttributes to include custom props
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  color: string;
  fontSize: string;
}

const Label = styled.label<LabelProps>`
  line-height: 1rem;
  font-weight: 600;
  padding-left: 0.25rem;
  color: ${(props) => props.color};
  font-size: ${(props) => props.fontSize};

  @media screen and (min-width: 1919px) {
    font-size: 1rem;
    line-height: 1.25rem;
  }
`;

const StyledInput = styled.input`
  width: 100%;
  height: 2.375rem;
  padding: 0.5rem;
  border: 1px solid ${(props: any) => props.theme.colors.inputColor};
  border-radius: ${(props) => props.theme.borderRadius};
  font-family: Arial, sans-serif;
  font-size: 0.75rem;

  &::placeholder {
    color: ${(props) => props.theme.colors.inputPlaceholderColor};
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

  const labelProps = {
    color: theme.colors.primary,
    fontSize: theme.fontSize.labelHeader,
  };

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
    <div>
      {label && <Label {...labelProps}>{label}</Label>}
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
    </div>
  );
}
