import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import React, { useState } from "react";
import styled from "styled-components";

const DropdownWrapper = styled.div`
  position: relative;
  width: 100%;

`;

const InputContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input`
  width: 100%;
  height: 1.5rem;
  padding: 7px;
  border-radius: 5px;
  font-family: Arial, sans-serif;
  font-size: 0.75rem;
  background-color: #f1f1f1;
  cursor: pointer;
  border: none;

  &:focus {
    outline: none;
    border-color: #666;
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  right: 5px;
  pointer-events: none; 
`;

const OptionsContainer = styled.div<{ show: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  display: ${({ show }) => (show ? "block" : "none")};
  max-height: 150px;
  overflow-y: auto;
  z-index: 100;
`;

const Option = styled.div`
  padding: 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;

  &:hover {
    background-color: #0B978E;
    color: #FFFFFF;
  }
`;

interface DropdownOption {
  key: string | number;
  text: string;
  value: string | number;
}

interface DropdownProps {
  name: string;
  options: DropdownOption[];
  onChange?: (name: string, value: string | number) => void;
  containerStyle?: React.CSSProperties;
  initialValue?: string;
}

export function CustomDropdown({ name, options, onChange, containerStyle, initialValue }: DropdownProps) {
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<string>(initialValue || "");

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    setShowOptions(false);
    if (onChange) onChange(name, value);
  };

  return (
    <DropdownWrapper style={containerStyle}>
      <InputContainer>
        <StyledInput
          value={selectedValue}
          readOnly
          onClick={() => setShowOptions(!showOptions)}
          placeholder="Select"
        />
        <IconWrapper>
          <SvgIcon name={CUSTOM_SVG_ICON.ArrowDown} />
        </IconWrapper>
      </InputContainer>
      <OptionsContainer show={showOptions}>
        {options.map((option) => (
          <Option key={option.key} onClick={() => handleSelect(option.value.toString())}>
            {option.text}
          </Option>
        ))}
      </OptionsContainer>
    </DropdownWrapper>
  );
}
