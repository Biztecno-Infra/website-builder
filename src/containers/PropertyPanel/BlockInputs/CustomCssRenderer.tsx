import React, { useState } from "react";
import styled from "styled-components";
import SvgIcon, { CUSTOM_SVG_ICON, SVGType } from "@components/SvgIcon";

interface CustomCSSRendererProps {
  customCss: Record<string, string>;
  handleDeleteCSS: (property: string) => void;
  handleEditCSS: (property: string, value: string) => void;
}

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const AppliedCSSText = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  line-height: 1rem;
`;

const CSSPropertyRow = styled.div`
  display: flex;
  align-items: center;
  width: 95%;
  margin-bottom: 0.5rem;
`;

const PropertyLabel = styled.div`
  margin-right: 0.25rem;
  width: 30%;
  font-size: 0.875rem;
`;

const InputField = styled.input`
  width: 50%;
  margin-right: 0.25rem;
`;

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
    <Container>
      {Object.keys(customCss).length > 0 && (
        <AppliedCSSText>Applied CSS</AppliedCSSText>
      )}

      {Object.entries(customCss).map(([property, value]) => (
        <CSSPropertyRow key={property}>
          <PropertyLabel>{property}:</PropertyLabel>
          <InputField
            type="text"
            value={newValues[property] !== undefined ? newValues[property] : value}
            onChange={(e) => handleValueChange(property, e)}
            onKeyDown={(e: any) => handleKeyDown(property, e)}
          />
          <SvgIcon
            name={CUSTOM_SVG_ICON.Check}
            size={"small"}
            baseclassname={"text-green-shade2 padding-1"}
            onClick={() => handleSaveEdit(property)}
          />
          <SvgIcon
            name={CUSTOM_SVG_ICON.Delete}
            size={"small"}
            baseclassname={"margin-l-1 text-danger-color"}
            onClick={() => handleDelete(property)}
          />
        </CSSPropertyRow>
      ))}
    </Container>
  );
};

export default CustomCSSRenderer;