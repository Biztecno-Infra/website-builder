import React, { useState, useCallback } from "react";
import styled from "styled-components";

interface CustomCSSInputProps {
  label: string;
  onAddProperty: (property: string, value: string) => void;
}

const InputLabel = styled.label`
  font-size: 1rem;
  margin-bottom: 0.5rem;
  display: block;
`;

const FlexContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
`;

const PropertyInput = styled.input`
  margin-right: 0.5rem;
  padding: 5px;
  font-size: 1rem;
  width: 150px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const ValueInput = styled.input`
  margin-right: 0.5rem;
  padding: 5px;
  font-size: 1rem;
  width: 150px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const AddButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: #218838;
  }
`;

const CssPropertiesList = styled.div`
  margin-top: 1rem;
`;

const CssPropertyItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const PropertyName = styled.span`
  font-size: 1rem;
`;

const EditButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: #007bff;
  padding: 2px 6px;

  &:hover {
    text-decoration: underline;
  }
`;

const DeleteButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: #dc3545;
  padding: 2px 6px;

  &:hover {
    text-decoration: underline;
  }
`;

export const CustomCSSInput: React.FC<CustomCSSInputProps> = ({
  label,
  onAddProperty,
}) => {
  const [cssProperties, setCssProperties] = useState<{ property: string; value: string }[]>([]);
  const [property, setProperty] = useState<string>("");
  const [value, setValue] = useState<string>("");

  const handleAddProperty = useCallback(() => {
    if (property && value) {
      const newProperty = { property, value };
      setCssProperties((prev) => [...prev, newProperty]);
      setProperty(""); // Reset property input
      setValue(""); // Reset value input
    }
  }, [property, value]);

  const handleDeleteProperty = useCallback((propertyToDelete: string) => {
    setCssProperties((prev) =>
      prev.filter((item) => item.property !== propertyToDelete)
    );
  }, []);

  const handleEditProperty = useCallback(
    (propertyToEdit: string, newValue: string) => {
      setCssProperties((prev) =>
        prev.map((item) =>
          item.property === propertyToEdit ? { ...item, value: newValue } : item
        )
      );
    },
    []
  );

  return (
    <>
      <InputLabel>{label}</InputLabel>
      <FlexContainer>
        <PropertyInput
          type="text"
          placeholder="Property (e.g. 'font-size')"
          value={property}
          onChange={(e) => setProperty(e.target.value)}
        />

        <ValueInput
          type="text"
          placeholder="Value (e.g. '16px')"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        <AddButton onClick={handleAddProperty}>+</AddButton>
      </FlexContainer>

      <CssPropertiesList>
        {cssProperties.map(({ property, value }) => (
          <CssPropertyItem key={property}>
            <PropertyName>{property}: {value}</PropertyName>
            <div>
              <EditButton
                onClick={() => {
                  const newValue = prompt("Edit Value", value);
                  if (newValue) handleEditProperty(property, newValue);
                }}
              >
                ✏️
              </EditButton>
              <DeleteButton
                onClick={() => handleDeleteProperty(property)}
              >
                🗑️
              </DeleteButton>
            </div>
          </CssPropertyItem>
        ))}
      </CssPropertiesList>
    </>
  );
};
