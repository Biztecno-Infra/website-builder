import classNames from "classnames";
import { CustomIconRef } from "./IconRef";

export interface Props {
  name: string; 
  circular?: boolean;
  size?: string | number; 
  baseclassname?: string; 
  inverted?: boolean;
  onClick?: () => void; 
  hover?: boolean; 
}

const SvgIcon = (props: Props) => {
  const { circular, name, size, baseclassname, inverted, onClick, hover } = props;

  const CustomIcon = CustomIconRef[name];

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className={classNames("custom-svg-icon", baseclassname, `${size}`, {
        circular: circular,
        hover: hover,
        inverted: inverted,
      })}
      onClick={handleClick}
      style={{
        display: "inline-block",
        width: size,
        height: size,
        ...(circular ? { borderRadius: "50%" } : {}),
      }}
    >
      {CustomIcon && <CustomIcon />}
    </div>
  );
};

export default SvgIcon;
