import AddButton from "./Icons/AddButton";
import AddColumns from "./Icons/AddColumns";
import AddImage from "./Icons/AddImage";
import AddText from "./Icons/AddText";
import CheckSVG from "./Icons/Check";
import DeleteSVG from "./Icons/Delete";
import DragIcon from "./Icons/DragIcon";
import PlusSVG from "./Icons/Plus";
import SectionIcon from "./Icons/SectionIcon";
import TreeIcon from "./Icons/TreeIcon";

export enum CUSTOM_SVG_ICON {
  Plus = "PlusSVG",
  Delete = "DeleteSVG",
  Check = "CheckSVG",
  SectionIcon = "SectionIcon",
  TreeIcon = "TreeIcon",
  DragIcon = "DragIcon",
  AddText = "AddText",
  AddImage = "AddImage",
  AddButton = "AddButton",
  AddColumns = "AddColumns",

}

export const CustomIconRef: any = {
  [CUSTOM_SVG_ICON.Plus]: PlusSVG,
  [CUSTOM_SVG_ICON.Delete]: DeleteSVG,
  [CUSTOM_SVG_ICON.Check]: CheckSVG,
  [CUSTOM_SVG_ICON.SectionIcon]: SectionIcon,
  [CUSTOM_SVG_ICON.TreeIcon]: TreeIcon,
  [CUSTOM_SVG_ICON.DragIcon]: DragIcon,

  [CUSTOM_SVG_ICON.AddText]: AddText,
  [CUSTOM_SVG_ICON.AddImage]: AddImage,
  [CUSTOM_SVG_ICON.AddButton]: AddButton,
  [CUSTOM_SVG_ICON.AddColumns]: AddColumns,

};
