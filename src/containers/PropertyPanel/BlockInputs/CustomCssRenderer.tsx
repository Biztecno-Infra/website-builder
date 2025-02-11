import React, { useState } from "react";
import SvgIcon, { CUSTOM_SVG_ICON, SVGType } from "@components/SvgIcon";
import { Input } from "semantic-ui-react";

interface CustomCSSRendererProps {
  customCss: Record<string, string>;
  handleDeleteCSS: (property: string) => void;
  handleEditCSS: (property: string, value: string) => void;
}

const CustomCSSRenderer: React.FC<CustomCSSRendererProps> = ({
  customCss,
  handleDeleteCSS,
  handleEditCSS,
}) => {
  const [newValues, setNewValues] = useState<Record<string, string>>(
    Object.fromEntries(Object.entries(customCss))
  );

  const handleValueChange = (
    property: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewValues((prevValues) => ({
      ...prevValues,
      [property]: event.target.value,
    }));
  };

  const handleSaveEdit = (property: string) => {
    const newValue = newValues[property];
    if (newValue !== customCss[property]) {
      handleEditCSS(property, newValue);
    }
  };

  const handleKeyDown = (property: string, event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSaveEdit(property);
    }
  };

  const handleDelete = (property: string) => {
    handleDeleteCSS(property);
  };

  return (
    <div className="flex flex-column width-100">
      {Object.keys(customCss).length > 0 && (
        <div
          style={{ fontSize: "0.85rem", fontWeight: "600", lineHeight: "1rem" }}
        >
          Applied CSS
        </div>
      )}

      {Object.entries(customCss).map(([property, value]) => (
        <div className="flex flex-align-center width-95 margin-b-2" key={property}>
          <div className="margin-r-1 width-30 text-4">{property}:</div>
          <Input
            type="text"
            value={newValues[property] !== undefined ? newValues[property] : value}
            onChange={(e) => handleValueChange(property, e)}
            onKeyDown={(e: any) => handleKeyDown(property, e)}
            className="width-50 margin-r-1"
          />
          <SvgIcon
            name={"check"}
            svgType={SVGType.SEMANTIC}
            size={"small"}
            baseclassname={"text-green-shade2 padding-1"}
            onClick={() => handleSaveEdit(property)}
          />
          <SvgIcon
            name={CUSTOM_SVG_ICON.Delete}
            svgType={SVGType.CUSTOM}
            size={"small"}
            baseclassname={"margin-l-1 text-danger-color"}
            onClick={() => handleDelete(property)} 
          />
        </div>
      ))}
    </div>
  );
};

export default CustomCSSRenderer;
