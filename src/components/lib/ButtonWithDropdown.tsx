import React, { useState } from "react";
import styled from "styled-components";
import { ButtonComponent } from "./Button";
import useClickOutside from "hoc/useClickOutside";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { SizeEnum } from "@components/SvgIcon/SvgIcon";

const DropdownContainer = styled.div`
  margin-left: 10px;
  margin-right: 20px;
  display: flex;
  min-width: 7.5rem;
`;

const DropdownList = styled.ul<{ open: any }>`
  position: absolute;
  background-color: white;
  border: 1px solid #ddd;
  top: 35px;
  list-style: none;
  z-index: 999;
  border-radius: 10px;
  padding: 0.95rem;
  display: ${(props) => (props.open ? "block" : "none")};
`;

const DropdownListItem = styled.li`
  padding: 10px;
  cursor: pointer;
  &:hover {
    background-color: #f1f1f1;
  }
`;

interface CustomDropdownProps {
  options: string[];
  onSelect: (option: string) => void;
  buttonText: string;
}

const CustomDropdownButton: React.FC<CustomDropdownProps> = ({
  options,
  onSelect,
  buttonText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useClickOutside(() => {
    if (isOpen) setIsOpen(false);
  });

  const handleSelect = (option: string) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <DropdownContainer ref={dropdownRef}>
      <ButtonComponent
        primary
        text={buttonText}
        handleClick={() => setIsOpen((prev) => !prev)}
        iconProps={{
          iconName: CUSTOM_SVG_ICON.ArrowDown, 
          iconPosition: "right",
          iconSize: SizeEnum.Small
        }}
      />
      <DropdownList open={isOpen}>
        {options.map((option, index) => (
          <DropdownListItem key={index} onClick={() => handleSelect(option)}>
            {option}
          </DropdownListItem>
        ))}
      </DropdownList>
    </DropdownContainer>
  );
};

export default CustomDropdownButton;
