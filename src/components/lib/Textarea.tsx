import React from "react";
import styled, { useTheme } from "styled-components";

const TextAreaContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 10px 0;
`;

const Label = styled.label<{ color: string; fontSize: string }>`
  line-height: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: ${({ color }) => color};
  font-size: ${({ fontSize }) => fontSize};

  @media screen and (min-width: 1919px) {
    font-size: 1rem;
    line-height: 1.25rem;
  }
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #DDDDDD;
  border-radius: 5px;
  font-family: Arial, sans-serif;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 4rem;
  // background-color: #F1F1F1;
  &::placeholder {
    color: ${({ theme }) => theme.colors.inputPlaceholderColor};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.inputDisabledBackground};
    border-color: ${({ theme }) => theme.colors.inputDisabledBorder};
    cursor: not-allowed;
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
  disabled?: boolean;
}

export function TextArea({
  label,
  name,
  value,
  placeholder,
  onChange,
  onBlur,
  rows = 4,
  disabled = false,
}: TextAreaProps) {
  const theme = useTheme();

  const handleTextAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) onChange(name, event.target.value);
  };

  return (
    <TextAreaContainer>
      {label && (
        <Label color={theme.colors.primary} fontSize={theme.fontSize.labelHeader}>
          {label}
        </Label>
      )}
      <StyledTextArea
        theme={theme}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={handleTextAreaChange}
        onBlur={onBlur}
        rows={rows}
        disabled={disabled}
      />
    </TextAreaContainer>
  );
}
