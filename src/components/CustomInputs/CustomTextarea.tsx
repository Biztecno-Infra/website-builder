import React, { useEffect, useState } from "react";
import classNames from "classnames";
import { TextArea } from "semantic-ui-react"; // Import TextArea from Semantic UI React

import "./style.scss";

interface IProps {
  label?: string;
  labelClassName?: string;
  baseClassName?: string;
  onChange?: (name: string, value: any) => void;
  inputClassName?: string;
  id: string;
  placeholder: string;
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  name: string;
  initialValue?: any;
  numberOfrows?: number;
}

export function CustomTextArea(props: IProps) {
  const {
    label,
    labelClassName,
    baseClassName,
    onChange,
    inputClassName,
    id,
    placeholder,
    onBlur,
    name,
    initialValue,
    numberOfrows = 4,
  } = props;

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target;
    if (typeof onChange === "function") {
      onChange(name, value);
    }
  };

  return (
    <div
      className={classNames([
        "flex flex-column customTextArea position-relative margin-1",
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
      <TextArea
        value={initialValue || ""}
        id={id}
        name={name}
        placeholder={placeholder}
        rows={numberOfrows}
        className={classNames("padding-2", inputClassName || "")}
        onBlur={onBlur}
        onChange={handleInputChange}
      />
    </div>
  );
}
