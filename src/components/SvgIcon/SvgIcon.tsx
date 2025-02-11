import { Icon } from "semantic-ui-react";
import classNames from "classnames";
import { CustomIconRef } from "./IconRef";

import "./SvgIcon.scss";

export enum SVGType {
  SEMANTIC = "SEMANTIC",
  CUSTOM = "CUSTOM"
}

export interface Props {
  svgType: SVGType;
  circular?: boolean;
  name: any;
  size?: any;
  baseclassname?: any;
  inverted?: boolean;
  onClick?: () => void;
  hover?: boolean;
}



const SvgIcon = (props: Props) => {
  const { circular, name, size, baseclassname, inverted, onClick , hover } = props;
  const CustomIcon = CustomIconRef[name];

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return props.svgType === SVGType.SEMANTIC ? (
    <Icon
      circular={circular}
      name={name}
      size={size}
      className={baseclassname}
      inverted={inverted}
      onClick={onClick}
    />
  ) : (
    <div
      className={classNames(["custom-svg-icon", baseclassname, `${size}`], {
        circular: circular, 
        hover: hover
      })}
      onClick={handleClick}
    >
      {CustomIcon && <CustomIcon />}
    </div>
  );
};

export default SvgIcon;