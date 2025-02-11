import React, { SyntheticEvent, useState, useCallback } from "react";
import { Dropdown, DropdownOnSearchChangeData, DropdownProps } from "semantic-ui-react";
import SvgIcon, { CUSTOM_SVG_ICON, SVGType } from "@components/SvgIcon";
import { CustomInput } from "@components/CustomInputs";
import "./style.scss";

const initialCssPropertiesList = [
  "alignItems", "background", "border", "borderRadius", "boxShadow", "color", "display", "fontSize",
  "fontFamily", "height", "margin", "padding", "textAlign", "width", "zIndex", "flex", "position",
  "top", "left", "right", "bottom", "transform", "overflow", "opacity", "visibility", "justifyContent",
  "gap", "gridTemplateColumns", "gridTemplateRows", "borderWidth", "wordSpacing", "letterSpacing",
  "textIndent", "maxWidth", "minWidth", "maxHeight", "minHeight",
];

interface CustomCSSInputProps {
  label: string;
  onAddProperty: (property: string, value: string) => void;
}

export const CustomCSSInput: React.FC<CustomCSSInputProps> = ({
  label,
  onAddProperty,
}) => {
  const [property, setProperty] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [cssPropertiesList, setCssPropertiesList] = useState<string[]>(initialCssPropertiesList);

  // Handle input changes and filter the CSS properties based on the user's input
  const handlePropertyChange = useCallback(
    (event: SyntheticEvent<HTMLElement, Event>, data: DropdownOnSearchChangeData) => {
      const newValue = data.value;
      setProperty(newValue as string);
    },
    []
  );

  // Function to handle the selection of a suggestion
  const handleSuggestionSelect = useCallback(
    (event: React.SyntheticEvent, data: any) => {
      setProperty(data.value); // Autofill the property input
    },
    []
  );

  // Handle adding new custom property to the list
  const handleAddItem = useCallback(
    (e: React.SyntheticEvent, { value }: DropdownProps) => {
      if (value && !cssPropertiesList.includes(value as string)) {
        setCssPropertiesList((prevList) => [...prevList, value as string]);
      }
      setProperty(value as string);
    },
    [cssPropertiesList]
  );

  const handleAdd = useCallback(() => {
    if (property && value) {
      onAddProperty(property, value);
      setProperty(""); // Reset property input
      setValue(""); // Reset value input
    }
  }, [property, value, onAddProperty]);

  // Prepare the items for the dropdown based on the updated list of CSS properties
  const dropdownItems = cssPropertiesList.map((prop) => ({
    key: prop,
    text: prop,
    value: prop,
  }));

  return (
    <>
      <label className="input-label">{label}</label>
      <div className="flex flex-row flex-align-center width-100">
        {/* Input field with Semantic UI dropdown */}
        <Dropdown
          search
          selection
          value={property}
          onChange={handleSuggestionSelect}
          onSearchChange={handlePropertyChange}
          placeholder="Property (e.g. 'font-size')"
          options={dropdownItems}
          className="margin-r-1 width-40 customcss-dropdown"
          allowAdditions={true} // Allow users to type new properties
          onAddItem={handleAddItem} // Handle adding new custom property
        />

        {/* Manual input field for value */}
        <CustomInput
          id={value}
          name={value}
          type="text"
          placeholder="Value (e.g. '16px')"
          value={value}
          onChange={(name, value) => setValue(value)}
          baseClassName="margin-r-1 width-40"
        />

        {/* Add button to confirm the property and value */}
        <SvgIcon
          name={CUSTOM_SVG_ICON.Plus}
          svgType={SVGType.CUSTOM}
          size={"small"}
          baseclassname={"cusror-pointer"}
          onClick={handleAdd}
        />
      </div>
    </>
  );
};
