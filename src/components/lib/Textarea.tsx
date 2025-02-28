import React from "react";
import styled, { useTheme } from "styled-components";

const StyledTextArea = styled.textarea`
&.ebr-styledTextArea{
  padding: 0.75rem;
  border: 1px solid #dddddd;
  border-radius: 5px;
  font-family: Arial, sans-serif;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 4rem;
  &::placeholder {
    color: ${({ theme }) => theme.colors.inputPlaceholderColor};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.inputDisabledBackground};
    border-color: ${({ theme }) => theme.colors.inputDisabledBorder};
    cursor: not-allowed;
  }
}
`;

interface TextAreaProps {
  name: string;
  value: string;
  placeholder?: string;
  onChange?: (name: string, value: string) => void;
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  disabled?: boolean;
}

export function TextArea({
  name,
  value,
  placeholder,
  onChange,
  onBlur,
  rows = 4,
  disabled = false,
}: TextAreaProps) {
  const theme = useTheme();

  const handleTextAreaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    if (onChange) onChange(name, event.target.value);
  };

  return (
    <StyledTextArea
      className="ebr-styledTextArea"
      theme={theme}
      name={name}
      value={value}
      placeholder={placeholder}
      onChange={handleTextAreaChange}
      onBlur={onBlur}
      rows={rows}
      disabled={disabled}
    />
  );
}
