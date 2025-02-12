import CheckSVG from "./Icons/Check";
import DeleteSVG from "./Icons/Delete";
import PlusSVG from "./Icons/Plus";

export enum CUSTOM_SVG_ICON {
  Plus = "PlusSVG",
  Delete = "DeleteSVG",
  Check = "CheckSVG"
}

export const CustomIconRef: any = {
  [CUSTOM_SVG_ICON.Plus]: PlusSVG,
  [CUSTOM_SVG_ICON.Delete] : DeleteSVG,
  [CUSTOM_SVG_ICON.Check] : CheckSVG
};
