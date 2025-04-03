import React from "react";
import styled from "styled-components";
import { CustomInput, Dropdown } from "@components/lib";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const BackgroundContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0;
  align-items: center;
  justify-content: space-between;
`;

const backgroundSizeOptions = [
  { key: "auto", text: "Auto", value: "auto" },
  { key: "cover", text: "Cover", value: "cover" },
  { key: "contain", text: "Contain", value: "contain" },
];

const backgroundPositionOptions = [
  { key: "left", text: "Left", value: "left" },
  { key: "center", text: "Center", value: "center" },
  { key: "right", text: "Right", value: "right" },
  { key: "top", text: "Top", value: "top" },
  { key: "bottom", text: "Bottom", value: "bottom" },
];

const backgroundRepeatOptions = [
  { key: "no-repeat", text: "No Repeat", value: "no-repeat" },
  { key: "repeat", text: "Repeat", value: "repeat" },
  { key: "repeat-x", text: "Repeat X", value: "repeat-x" },
  { key: "repeat-y", text: "Repeat Y", value: "repeat-y" },
];

interface BackgroundPropertiesProps {
  onChange: (field: string, value: any) => void;
  backgroundImage: string;
  backgroundSize: string;
  backgroundPosition: string;
  backgroundRepeat: string;
  containerStyle?: React.CSSProperties;
}

export const BackgroundProperties: React.FC<BackgroundPropertiesProps> = ({
  onChange,
  backgroundImage,
  backgroundSize,
  backgroundPosition,
  backgroundRepeat,
  containerStyle,
}) => {
  return (
    <Wrapper style={containerStyle}>
      <CustomInput
        name="backgroundImage"
        type="text"
        value={backgroundImage}
        onChange={(name, value) => onChange("backgroundImage", value)}
        placeholder="Enter background URL here"
        containerStyle={{ width: "100%" }}
      />

      <BackgroundContainer>
        <Dropdown
          name="backgroundSize"
          options={backgroundSizeOptions}
          onChange={(name, value) => onChange("backgroundSize", value)}
          initialValue={backgroundSize}
          containerStyle={{  width: "100%" , marginTop: "0.25rem" }}
        />
        <Dropdown
          name="backgroundPosition"
          options={backgroundPositionOptions}
          onChange={(name, value) => onChange("backgroundPosition", value)}
          initialValue={backgroundPosition}
          containerStyle={{  width: "100%", marginTop: "0.25rem" }}
        />
        <Dropdown
          name="backgroundRepeat"
          options={backgroundRepeatOptions}
          onChange={(name, value) => onChange("backgroundRepeat", value)}
          initialValue={backgroundRepeat}
          containerStyle={{  width: "100%", marginTop: "0.25rem" }}
        />
      </BackgroundContainer>
    </Wrapper>
  );
};
