import React, { useEffect, useState } from "react";
import styled from "styled-components";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import useClickOutside from "hoc/useClickOutside";

const DropdownWrapper = styled.div`
  position: relative;
  width: 100%;
  padding: 3px;
  background-color: #f1f1f1;
  border-radius: 5px;
  // height: 30px;
`;

const InputContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
// height: 100%;
`;

const StyledInput = styled.input`
  &.ebr-styledInputDropdown {
    width: 100%;
     height: 30px;
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
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  right: 5px;
  pointer-events: none;
`;

const OptionsContainer = styled.div<{ $show: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  display: ${({ $show }) => ($show ? "block" : "none")};  // Changed to $show
  max-height: 150px;
  overflow-y: auto;
  z-index: 100;
`;

const Option = styled.div`
  padding: 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;

  &:hover {
    background-color: #0b978e;
    color: #ffffff;
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

export function Dropdown({
  name,
  options,
  onChange,
  containerStyle,
  initialValue,
}: DropdownProps) {
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<string>("");

  const dropdownRef = useClickOutside(() => setShowOptions(false));

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    setShowOptions(false);
    if (onChange) onChange(name, value);
  };

  useEffect(() => {
    if (initialValue) {
      setSelectedValue(initialValue);
    } else {
      setSelectedValue("")
    }
  }, [initialValue]);

  return (
    <DropdownWrapper ref={dropdownRef} style={containerStyle}>
      <InputContainer>
        <StyledInput
          className="ebr-styledInputDropdown"
          value={selectedValue}
          readOnly
          onClick={() => setShowOptions(!showOptions)}
          placeholder="Select"
        />
        <IconWrapper>
          <SvgIcon name={CUSTOM_SVG_ICON.ArrowDown} />
        </IconWrapper>
      </InputContainer>
      <OptionsContainer $show={showOptions}>
        {options.map((option) => (
          <Option
            key={option.key}
            onClick={() => handleSelect(option.value.toString())}
          >
            {option.text}
          </Option>
        ))}
      </OptionsContainer>
    </DropdownWrapper>
  );
}