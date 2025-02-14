import React, { useState } from "react";
import styled from "styled-components";
import { ButtonComponent } from "./Button";
import useClickOutside from "hoc/useClickOutside";

// Styled Components
const DropdownContainer = styled.div`
  position: relative;
  width: 150px;
`;

const DropdownMenu = styled.ul<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: white;
  border-radius: 5px;
  margin-top: 5px;
  list-style: none;
  padding: 5px 0;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  display: ${(props) => (props.isOpen ? "block" : "none")};
`;

const DropdownItem = styled.li`
  padding: 10px;
  font-size: 14px;
  color: black;
  cursor: pointer;
  text-align: left;

  &:hover {
    background: #f2f2f2;
  }
`;

// Dropdown Component
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

  return (
    <DropdownContainer ref={dropdownRef}>
      <ButtonComponent
        primary
        text={buttonText}
        handleClick={() => setIsOpen((prev) => !prev)}
      />
      <DropdownMenu isOpen={isOpen}>
        {options.map((option) => (
          <DropdownItem
            key={option}
            onClick={() => {
              onSelect(option);
              setIsOpen(false);
            }}
          >
            {option}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </DropdownContainer>
  );
};

export default CustomDropdownButton;
