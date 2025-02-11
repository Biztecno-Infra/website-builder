import React from "react";
import { Tab } from "semantic-ui-react";

// Define a generic interface for the TabComponent
interface TabComponentProps {
  activeIndex: number; // The active tab's index
  onTabChange: (activeIndex: number) => void; // Handler for tab change
  panes: { menuItem: React.ReactNode; render?: React.ReactNode }[]; // Array of panes for each tab
  menuProps?: any; // Additional props to customize the tab menu
  style?: React.CSSProperties; // Optional styles for customization
  className?: any
}

const TabComponent: React.FC<TabComponentProps> = ({
  activeIndex,
  onTabChange,
  panes,
  menuProps = { secondary: true, pointing: true },
  style,
  className
}) => {
  return (
    <div
      style={style}
      className={className}
    >
      <Tab
        menu={menuProps}
        panes={panes as any}
        activeIndex={activeIndex}
        onTabChange={(_, data) => onTabChange(data.activeIndex as number)}
      />
    </div>
  );
};

export default TabComponent;
