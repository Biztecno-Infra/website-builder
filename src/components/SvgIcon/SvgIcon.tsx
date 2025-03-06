import React from 'react';
import styled, { css } from 'styled-components';
import { CustomIconRef } from './IconRef';
import { SizeEnum } from 'enum';

export const sizeMapping: { [key in SizeEnum]: string } = {
  [SizeEnum.Small]: '1.2rem',
  [SizeEnum.Medium]: '2rem',
  [SizeEnum.Large]: '3rem',
  [SizeEnum.Huge]: '4rem',
  [SizeEnum.Mini]: '0.8rem',
};

export interface Props {
  name: keyof typeof CustomIconRef;
  circular?: boolean;
  size?: SizeEnum;
  inverted?: boolean;
  onClick?: () => void;
  hover?: boolean;
  color?: string;
  bgColor?: string;
  svgStyle?: React.CSSProperties;
}

const SvgIconContainer = styled.div<Props>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${(props) => (props.size ? sizeMapping[props.size] : 'unset')};
  height: ${(props) => (props.size ? sizeMapping[props.size] : 'unset')};
  color: ${(props) => props.color || 'currentColor'}; 
  background-color: ${(props) => props.bgColor || 'transparent'};

  ${(props) =>
    props.circular &&
    css`
      border-radius: 20%;
    `}

  ${(props) =>
    props.hover &&
    css`
      cursor: pointer;
      &:hover {
        opacity: 0.8;
      }
    `}

  ${(props) =>
    props.inverted &&
    css`
      filter: invert(1);
    `}
`;

const SvgIcon: React.FC<Props> = ({
  name,
  circular,
  size,
  inverted,
  onClick,
  hover,
  color,
  bgColor,
  svgStyle
}) => {
  const CustomIcon = CustomIconRef[name];

  const handleClick = () => {
    if (typeof onClick === "function") {
      onClick();
    }
  };

  return (
    <SvgIconContainer
      circular={circular}
      size={size}
      inverted={inverted}
      hover={hover}
      onClick={handleClick}
      color={color}
      bgColor={bgColor}
      name={name}
      style={svgStyle}
    >
      {CustomIcon && <CustomIcon />}
    </SvgIconContainer>
  );
};

export default SvgIcon;
