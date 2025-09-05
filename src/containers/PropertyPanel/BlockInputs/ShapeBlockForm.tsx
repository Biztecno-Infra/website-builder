// ShapeBlockForm.tsx

import React from "react";
import { CustomInput, Dropdown } from "@components/lib";
// import { ShapeProps } from "types";
// import { Input, Select } from "antd";

interface ShapeBlockFormProps {
  selectedBlock: any;
  updateBlock: (blockId: string, property: string, value: any) => void;
}

const shapeOptions = [
  { text: "Rectangle", value: "rectangle" },
  { text: "Rounded Rectangle", value: "rounded" },
  { text: "Circle", value: "circle" },
  { text: "Oval", value: "oval" },
];

const ShapeBlockForm: React.FC<ShapeBlockFormProps> = ({
  selectedBlock,
  updateBlock,
}) => {
  const handleChange = (key: keyof any, value: any) => {
    // updateBlock(selectedBlock.id, key, value);
  };

  return (
    <div style={{ padding: "1rem" }}>
      <label>Shape</label>
      <Dropdown
        // value={selectedBlock.shape}
        options={shapeOptions as any}
        onChange={(name , val) => handleChange("shape", val)}
        containerStyle={{ width: "100%", marginBottom: "1rem" }}
        name="shape"
      />

      <label>Text</label>
      <CustomInput
        value={selectedBlock.text}
        onChange={(name , value) => handleChange("text",value)}
        containerStyle={{ marginBottom: "1rem" }}
        name="text"
      />

      <label>Width</label>
      <CustomInput
        value={selectedBlock.width}
        onChange={(name , value) => handleChange("width", value)}
        containerStyle={{ marginBottom: "1rem" }}
        placeholder="e.g. 200px"
        name="width"
        type="number"
      />

      <label>Height</label>
      <CustomInput
        value={selectedBlock.height}
        onChange={(name , value) => handleChange("height" , value)}
        containerStyle={{ marginBottom: "1rem" }}
        placeholder="e.g. 100px"
        name="height"
        type="number"
      />

      <label>Background Color</label>
      <CustomInput
        value={selectedBlock.backgroundColor}
        onChange={(name , value ) => handleChange("backgroundColor" , value)}
        placeholder="e.g. #FF5733"
        name="backgroundColor"
      />
    </div>
  );
};

export default ShapeBlockForm;
