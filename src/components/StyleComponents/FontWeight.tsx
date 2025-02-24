import { CustomDropdown } from "@components/CustomInputs";


interface FontWeightDropdownProps {
  onChange: (field: string, value: string) => void;
  value: string;
  style?: React.CSSProperties;
}
// Define font weight options for the dropdown
const fontWeightOptions = [
  { key: "light", text: "Light (100)", value: "100" },
  { key: "normal", text: "Normal (400)", value: "400" },
  { key: "medium", text: "Medium (500)", value: "500" },
  { key: "bold", text: "Bold (700)", value: "700" },
  { key: "bolder", text: "Bolder (900)", value: "900" },
];

export const FontWeightDropdown = ({ onChange , value , style }: FontWeightDropdownProps) => {
  // Handle dropdown change
  return (
    <CustomDropdown
      name="fontWeight"
      options={fontWeightOptions}
      // placeholder="Select Font Weight"
      onChange={(name, value) => onChange("fontWeight", value as string)}
      containerStyle={style}
      initialValue={value}
    />
  );
};
