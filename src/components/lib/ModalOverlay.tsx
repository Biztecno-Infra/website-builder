import React from "react";
import styled from "styled-components";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { SizeEnum } from "enum";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div<{ isSmall: boolean }>`
  background: white;
  width: ${(props) => (props.isSmall ? '275px' : '400px')};
  border-radius: 10px;
  padding: 20px;
  position: relative;
  text-align: center;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
`;

const CloseButton = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
`;

const ModalOverlay: React.FC<{
  onClose: () => void;
  children: React.ReactNode;
  isSmall?: boolean; 
}> = ({ onClose, children, isSmall }) => {
  return (
    <Overlay>
      <ModalContainer isSmall={isSmall || false}>
        <CloseButton onClick={onClose}>
          <SvgIcon name={CUSTOM_SVG_ICON.Close} size={SizeEnum.Mini} />
        </CloseButton>
        {children}
      </ModalContainer>
    </Overlay>
  );
};

export default ModalOverlay;
