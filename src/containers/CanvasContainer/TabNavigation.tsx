import React from "react";
import { Tab } from "semantic-ui-react";
import { ViewMode } from "../../types";

interface TabNavigationProps {
  viewMode: ViewMode;
  onTabChange: (view: ViewMode) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  viewMode,
  onTabChange,
}) => {
  const panes = [
    {
      menuItem: { key: ViewMode.Canvas, icon: "file code", content: "Canvas" },
    },
    { menuItem: { key: ViewMode.Json, icon: "edit", content: "JSON" } },
    { menuItem: { key: ViewMode.Html, icon: "terminal", content: "HTML" } },
  ];

  return (
    <Tab
      menu={{ secondary: true, pointing: true, fluid: true }}
      className="width-100"
      panes={panes}
      activeIndex={
        viewMode === ViewMode.Canvas ? 0 : viewMode === ViewMode.Json ? 1 : 2
      }
      onTabChange={(_, data) =>
        onTabChange(
          data.activeIndex === 0
            ? ViewMode.Canvas
            : data.activeIndex === 1
            ? ViewMode.Json
            : ViewMode.Html
        )
      }
    />
  );
};
