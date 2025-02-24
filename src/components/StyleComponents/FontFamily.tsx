import { CustomDropdown } from "@components/CustomInputs";

const fontOptions = [
  { key: "arial", text: "Arial", value: "Arial" },
  { key: "times", text: "Times New Roman", value: "Times New Roman" },
  { key: "courier", text: "Courier New", value: "Courier New" },
  { key: "georgia", text: "Georgia", value: "Georgia" },
  { key: "verdana", text: "Verdana", value: "Verdana" },
  { key: "tahoma", text: "Tahoma", value: "Tahoma" },
  { key: "impact", text: "Impact", value: "Impact" },
  { key: "comic", text: "Comic Sans MS", value: "Comic Sans MS" },
  { key: "helvetica", text: "Helvetica", value: "Helvetica" },
  { key: "calibri", text: "Calibri", value: "Calibri" },
  { key: "lucida", text: "Lucida Sans", value: "Lucida Sans" },
  { key: "palatino", text: "Palatino Linotype", value: "Palatino Linotype" },
  { key: "trebuchet", text: "Trebuchet MS", value: "Trebuchet MS" },
  { key: "arialblack", text: "Arial Black", value: "Arial Black" },
  { key: "rockwell", text: "Rockwell", value: "Rockwell" },
  { key: "helveticaNeue", text: "Helvetica Neue", value: "Helvetica Neue" },
  { key: "garamond", text: "Garamond", value: "Garamond" },
  { key: "bookman", text: "Bookman Old Style", value: "Bookman Old Style" },
  { key: "futura", text: "Futura", value: "Futura" },
  { key: "montserrat", text: "Montserrat", value: "Montserrat" },
  { key: "openSans", text: "Open Sans", value: "Open Sans" },
  { key: "roboto", text: "Roboto", value: "Roboto" },
  { key: "lato", text: "Lato", value: "Lato" },
  { key: "oswald", text: "Oswald", value: "Oswald" },
  { key: "playfair", text: "Playfair Display", value: "Playfair Display" },
  { key: "merriweather", text: "Merriweather", value: "Merriweather" },
];

interface FontFamilyDropdownProps {
  onChange: (field: string, value: string) => void;
  value: any;
  style?: React.CSSProperties;
}

export const FontFamilyDropdown: React.FC<FontFamilyDropdownProps> = ({
  onChange,
  value,
  style
}) => {
  return (
    <CustomDropdown
      name="fontFamily"
      options={fontOptions}
      onChange={(name, value) => onChange("fontFamily", value as any)}
      containerStyle={style}
    />
  );
};
