import React, { useState, useEffect } from "react";
import classNames from "classnames";
import { Dropdown, DropdownProps } from "semantic-ui-react"; // Import Dropdown from Semantic UI React

import "./style.scss";

interface IProps {
  label?: string;
  labelClassName?: string;
  baseClassName?: string;
  onChange?: (name: string, value: any) => void;
  inputClassName?: string;
  id: string;
  placeholder: string;
  options: { key: string | number; text: string; value: string | number }[]; // Options for the dropdown
  name: string;
  initialValue?: any;
  disabled?: boolean;
}

export function CustomDropdown(props: IProps) {
  const {
    label,
    labelClassName,
    baseClassName,
    onChange,
    inputClassName,
    id,
    placeholder,
    options,
    name,
    initialValue,
    disabled = false,
  } = props;

  const handleDropdownChange = (
    event: React.SyntheticEvent<HTMLElement, Event>,
    data: DropdownProps
  ) => {
    const { value } = data;
    if (typeof onChange === "function") {
      onChange(name, value);
    }
  };

  return (
    <div
      className={classNames([
        "flex flex-column customDropdown position-relative",
        baseClassName,
      ])}
    >
      {label && (
        <div
          className={classNames(["input-label padding-b-1", labelClassName])}
        >
          {label}
        </div>
      )}
      <Dropdown
        id={id}
        name={name}
        placeholder={placeholder}
        fluid
        selection
        options={options}
        value={initialValue}
        onChange={handleDropdownChange}
        disabled={disabled}
        className={classNames([inputClassName || ""])}
      />
    </div>
  );
}

