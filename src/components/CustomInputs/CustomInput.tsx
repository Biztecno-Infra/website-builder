import React, { useState } from "react";
import classNames from "classnames";
import SvgIcon, { SVGType } from "@components/SvgIcon";
import { IconSizeProp } from "semantic-ui-react/dist/commonjs/elements/Icon/Icon";
import { Input } from "semantic-ui-react";
import "./style.scss";

interface IICONPROPS {
  svgType: SVGType;
  circular?: boolean;
  name: any;
  size?: IconSizeProp;
  baseclassname?: any;
  inverted?: boolean;
}

interface IProps {
  label?: string;
  labelClassName?: string;
  baseClassName?: string;
  onChange?: (name: string, value: any) => void;
  inputClassName?: string;
  id: string;
  placeholder: string;
  iconProps?: IICONPROPS;
  disabled?: boolean;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  name: string;
  value: any;
  iconRight?: boolean;
  type?: string;
}

export function CustomInput(props: IProps) {
  const {
    label,
    labelClassName,
    baseClassName,
    onChange,
    inputClassName,
    id,
    placeholder,
    iconProps,
    disabled,
    onBlur,
    name,
    value,
    iconRight,
    type,
  } = props;

  const [error, setError] = useState<string>("");

  // Handle input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const numericValue = Number(event.target.value);
    if (type === "number") {
    
      if (numericValue < 0) {
        setError("Value must be greater than or equal to 0");
        return;
      }
    
      if (name === "columns" && numericValue < 1) {
        setError("Columns must be 1 or greater");
        return;
      } else {
        setError("");
      }
    }
    

    // Pass the change to the parent component
    if (typeof onChange === "function") {
      onChange(name, type ==="number" ? numericValue : value);
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (onBlur) {
      onBlur(event);
    }
  };

  return (
    <div
      className={classNames([
        "flex flex-column customInput position-relative",
        baseClassName,
      ])}
    >
      {label && (
        <div className={classNames(["input-label padding-b-1", labelClassName])}>
          {label}
        </div>
      )}
      {iconProps && (
        <SvgIcon
          {...iconProps}
          baseclassname={classNames([
            "input-search",
            { "input-search-right": iconRight },
          ])}
        />
      )}
      <Input
        type={type || "text"}
        value={value}
        id={id}
        name={name}
        placeholder={placeholder}
        disabled={disabled}
        onBlur={handleBlur}
        onChange={handleInputChange}
        error={error ? true : false}
      />
      {error && <div className="error-message text-3 text-danger-color">{error}</div>}
    </div>
  );
}
