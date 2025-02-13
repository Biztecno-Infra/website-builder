import React from "react";
import styled from "styled-components";

const DropdownContainer = styled.div`
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

const StyledSelect = styled.select`
  width: 100%;
  height: 2.375rem !important;
  padding: 0.5rem !important;
  min-height: 2rem !important;
  border: 1px solid #ccc;
  border-radius: 10px;
  font-family: Arial, sans-serif;
  font-size: 0.75rem;
  background-color: white;
  cursor: pointer;
  appearance: none;

  &::placeholder {
    color: rgba(191, 191, 191, 0.87);
  }
`;

const Option = styled.option`
  font-size: 0.75rem !important;
`;

interface DropdownOption {
  key: string | number;
  text: string;
  value: string | number;
}

interface DropdownProps {
  label?: string;
  onChange?: (name: string, value: string | number) => void;
  name: string;
  initialValue?: string | number;
  placeholder?: string;
  options: DropdownOption[];
  disabled?: boolean;
}

export function CustomDropdown({
  label,
  onChange,
  name,
  initialValue = "",
  placeholder,
  options,
  disabled = false,
}: DropdownProps) {
  const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(name, event.target.value);
    }
  };

  return (
    <DropdownContainer>
      {label && <Label>{label}</Label>}
      <StyledSelect name={name} value={initialValue} onChange={handleDropdownChange} disabled={disabled}>
        {placeholder && <Option value="">{placeholder}</Option>}
        {options.map((option) => (
          <Option key={option.key} value={option.value}>
            {option.text}
          </Option>
        ))}
      </StyledSelect>
    </DropdownContainer>
  );
}
