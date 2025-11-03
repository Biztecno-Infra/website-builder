import { FormWrapper, FlexRow, FlexContainer } from "../style";
import { CustomInput, ReactColorPicker, TextArea } from "@components/lib";
import { AlignmentSelector, PaddingInput } from "@components/StyleComponents";
import { BorderStyleDropdown } from "@components/StyleComponents/BorderStyle";
import { BlockFormProps } from "../types";
import { VideoProps } from "types";
import BasePropertyWrapper from "@components/BasePropertyWrapper";
import styled, { useTheme } from "styled-components";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { useBlockForm } from "../useBlockForm";

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #dddddd;
`;

export const VideoBlockForm = ({
  selectedBlock,
  updateBlock,
  selectedBrand
}: BlockFormProps) => {
  const theme = useTheme();
  const { formData, handleChange } = useBlockForm(
    selectedBlock as VideoProps,
    updateBlock
  );

  return (
    <FormWrapper>
      <BasePropertyWrapper name="Edit Video">
        {/* Layer Name */}
        <CustomInput
          name="layerName"
          placeholder="Enter Layer Name"
          value={formData.layerName || ""}
          onChange={(name, value) => handleChange("layerName", value)}
          containerStyle={{ width: "100%", marginBottom: "10px" }}
        />

        <CustomInput
          name="youtubeVideoUrl"
          placeholder="Enter YouTube or Vimeo URL"
          value={formData.youtubeVideoUrl || ""}
          onChange={(name, value) => handleChange("youtubeVideoUrl", value)}
          containerStyle={{ width: "100%", marginBottom: "10px" }}
          disabled={!!formData.videoUrl}
        />

        <CustomInput
          name="videoUrl"
          placeholder="Enter direct video file URL"
          value={formData.videoUrl || ""}
          onChange={(name, value) => handleChange("videoUrl", value)}
          containerStyle={{ width: "100%", marginBottom: "10px" }}
          disabled={!!formData.youtubeVideoUrl}
        />

        {/* Thumbnail only if direct video entered */}
        {formData.videoUrl && !formData.youtubeVideoUrl && (
          <>
            {/* <label htmlFor="thumbnailUrl">
              Thumbnail (required for direct video)
            </label> */}
            <CustomInput
              name="thumbnailUrl"
              placeholder="Enter thumbnail image URL"
              value={formData.thumbnailUrl || ""}
              onChange={(name, value) => handleChange("thumbnailUrl", value)}
              containerStyle={{ width: "100%", marginBottom: "10px" }}
            />
          </>
        )}
        {/* NavigateTo link */}
        {/* <CustomInput
          name="navigateToUrl"
          placeholder="Add URL to link video"
          value={formData.navigateToUrl || ""}
          onChange={handleChange}
          containerStyle={{ marginBottom: "0.75rem", padding: 2 }}
          type="text"
        /> */}

        {/* Dimensions */}
        <FlexRow>
          <CustomInput
            type="number"
            name="width"
            placeholder="auto"
            value={formData.width || ""}
            onChange={(name, value) => handleChange("width", value)}
            unitsLabel="%"
            iconProps={{
              name: CUSTOM_SVG_ICON.ImageWidth,
            }}
            containerStyle={{
              width: "45%",
              marginRight: "1rem",
              padding: 2,
            }}
            inputStyle={{ width: "35%" }}
            isPercentageValidation
          />
          <AlignmentSelector
            onChange={handleChange}
            value={formData.alignment}
            containerStyle={{ width: "60%" }}
          />
        </FlexRow>

        {/* Alignment */}
      </BasePropertyWrapper>

      <Divider />

      {/* Container properties */}
      <BasePropertyWrapper name="Edit Container">
        <FlexRow>
          <ReactColorPicker
            onColorChange={(field, value) =>
              handleChange("backgroundColor", value)
            }
            selectedColor={formData.backgroundColor}
            containerStyle={{ width: "53%" }}
            selectedBrand={selectedBrand}
          />
          <PaddingInput
            padding={
              formData.padding || { top: 0, right: 0, bottom: 0, left: 0 }
            }
            onChange={(padding) => handleChange("padding", padding)}
            containerStylePopUp={{ width: "45%" }}
          />
        </FlexRow>
        <BasePropertyWrapper
          name="Border Properties"
          subLabel
          containerStyle={{
            border: "none",
            padding: 0,
            width: "95%",
            margin: "0.5rem",
          }}
        >
          <BorderStyleDropdown
            onChange={handleChange}
            borderWidth={formData.borderWidth}
            borderStyle={formData.borderStyle}
            borderColor={formData.borderColor}
            borderRadius={formData.borderRadius}
            selectedBrand={selectedBrand}
            containerStyle={{
              border: "1px solid #DDDDDD",
              borderRadius: "10px",
              padding: "0.5rem",
            }}
          />
        </BasePropertyWrapper>
      </BasePropertyWrapper>
      <BasePropertyWrapper name="Hide Element">
        <FlexContainer>
          <SvgIcon
            name={CUSTOM_SVG_ICON.DesktopIcon}
            onClick={() =>
              handleChange("hideOnDesktop", !formData.hideOnDesktop)
            }
            svgStyle={{
              cursor: "pointer",
              padding: "0.5rem",
              borderRight: " 1px solid #DDDDDD",
              width: "50%",
              color: formData.hideOnDesktop ? theme.colors.background :theme.colors.primary 
            }}
          />
          <SvgIcon
            name={CUSTOM_SVG_ICON.MobileIcon}
            onClick={() => handleChange("hideOnMobile", !formData.hideOnMobile)}
            svgStyle={{
              cursor: "pointer",
              padding: "0.5rem",
              width: "50%",
              color: formData.hideOnMobile ? theme.colors.background :theme.colors.primary 
            }}
          />
        </FlexContainer>
      </BasePropertyWrapper>
      <BasePropertyWrapper name="Additional Properties">
        <TextArea
          name="customCss"
          placeholder="Enter additional CSS e.g. font-size: 14px; {key}: {value};"
          value={formData.customCss || ""}
          rows={6}
          onChange={(name, value) => handleChange("customCss", value)}
        />
      </BasePropertyWrapper>
    </FormWrapper>
  );
};
