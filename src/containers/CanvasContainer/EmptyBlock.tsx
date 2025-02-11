import SvgIcon, { CUSTOM_SVG_ICON, SVGType } from "@components/SvgIcon";

const EmptyBlock = () => {
  return (
    <div className="flex flex-column flex-align-center flex-justify-center width-100 height-100 text-7">
      <div>Drag block and drop here</div>
      <SvgIcon
        name={CUSTOM_SVG_ICON.Plus}
        svgType={SVGType.CUSTOM}
        size={"large"}
        baseclassname={"margin-t-4"}
      />
    </div>
  );
};

export default EmptyBlock;
