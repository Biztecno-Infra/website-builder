// components/Tooltip.tsx
import React from 'react';
import styled from 'styled-components';

const TooltipContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const TooltipContent = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
  margin-bottom: 5px;
  
  /* Tooltip arrow */
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: #333 transparent transparent transparent;
  }
  
  /* Hide by default */
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;

  ${TooltipContainer}:hover & {
    opacity: 1;
    visibility: visible;
  }
`;

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  style?: any;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children , style }) => {
  return (
    <TooltipContainer style={style|| {}}>
      {children}
      <TooltipContent>
        {content}
      </TooltipContent>
    </TooltipContainer>
  );
};