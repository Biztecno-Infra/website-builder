import AddButton from "./Icons/AddButton";
import AddColumns from "./Icons/AddColumns";
import AddImage from "./Icons/AddImage";
import AddLine from "./Icons/AddLine";
import AddSpacer from "./Icons/AddSpacer";
import AddText from "./Icons/AddText";
import ArrowDown from "./Icons/ArrowDown";
import CenterAlign from "./Icons/CenterAlign";
import CheckSVG from "./Icons/Check";
import ClearEmail from "./Icons/ClearEmail";
import Close from "./Icons/Close";
import DeleteSVG from "./Icons/Delete";
import DeleteBlock from "./Icons/DeleteBlock";
import DragIcon from "./Icons/DragIcon";
import EmptyCanvasSVG from "./Icons/EmptyCanvas";
import ExpandIcon from "./Icons/ExpandIcon";
import FileTypeHtml from "./Icons/FileTypeHtml";
import FileTypeJson from "./Icons/FileTypeJson";
import JustifyAlign from "./Icons/JustifyAlign";
import LeftAlign from "./Icons/LeftAlign";
import LineHeight from "./Icons/LineHeight";
import PaddingExpand from "./Icons/PaddingExpand";
import PlusSVG from "./Icons/Plus";
import RightAlign from "./Icons/RightAlign";
import SectionIcon from "./Icons/SectionIcon";
import TreeIcon from "./Icons/TreeIcon";
import Upload from "./Icons/Upload";

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
  AddLine = "AddLine",
  AddSpacer = "AddSpacer",
  HtmlFile = "FileTypeHtml",
  JsonFile = "FileTypeJson",
  Close = "Close",
  ArrowDown = "ArrowDown",
  UploadIcon = "Upload",
  ClearEmail = "ClearEmail",
  ExpandIcon = "ExpandIcon",
  DeleteBlock = "DeleteBlock",
  EmptyCanvas = "EmptyCanvasSVG",
  LeftAlign = "LeftAlign" , 
  RightAlign = "RightAlign", 
  CenterAlign = "CenterAlign",
  JustifyAlign = "JustifyAlign",
  PaddingExpand = "PaddingExpand",
  LineHeight = "LineHeight"
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
  [CUSTOM_SVG_ICON.AddLine]: AddLine,
  [CUSTOM_SVG_ICON.AddSpacer]: AddSpacer,
  [CUSTOM_SVG_ICON.HtmlFile]: FileTypeHtml,
  [CUSTOM_SVG_ICON.JsonFile]: FileTypeJson,
  [CUSTOM_SVG_ICON.Close]: Close,
  [CUSTOM_SVG_ICON.ArrowDown]: ArrowDown,
  [CUSTOM_SVG_ICON.UploadIcon]: Upload,
  [CUSTOM_SVG_ICON.ClearEmail]: ClearEmail,
  [CUSTOM_SVG_ICON.ExpandIcon]: ExpandIcon,
  [CUSTOM_SVG_ICON.DeleteBlock]: DeleteBlock,
  [CUSTOM_SVG_ICON.EmptyCanvas] : EmptyCanvasSVG,
  [CUSTOM_SVG_ICON.LeftAlign] : LeftAlign,
  [CUSTOM_SVG_ICON.RightAlign] : RightAlign,
  [CUSTOM_SVG_ICON.CenterAlign] : CenterAlign,
  [CUSTOM_SVG_ICON.JustifyAlign] : JustifyAlign,
  [CUSTOM_SVG_ICON.PaddingExpand] : PaddingExpand,
  [CUSTOM_SVG_ICON.LineHeight] : LineHeight
};
