import React from "react";
import styled, { useTheme } from "styled-components";

const TextAreaContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  margin: 10px 0;
`;

const Label = styled.label`
  line-height: 1rem;
  font-weight: 600;
  padding-left: 0.25rem;
  color:  ${(props) => props.color};
  font-size: ${(props: any) => props.fontSize};
  @media screen and (min-width: 1919px) {
    font-size: 1rem;
    line-height: 1.25rem;
  }
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid ${(props: any) => props.theme.colors.inputColor}; 
  border-radius: ${(props) => props.theme.borderRadius};
  font-family: Arial, sans-serif;
  font-size: 0.75rem;
  resize: vertical;
  min-height: 4rem;

  &::placeholder {
    color: ${(props) => props.theme.colors.inputPlaceholderColor}; 
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
  const theme = useTheme();
  const handleTextAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) onChange(name, event.target.value);
  };

  return (
    <TextAreaContainer>
      {label &&
        <Label
          color={theme.colors.primary}
          font-Size={theme.fontSize.labelHeader}>
          {label}
        </Label>}
      <StyledTextArea
        theme={theme}
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
