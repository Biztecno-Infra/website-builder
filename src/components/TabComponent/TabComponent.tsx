import React from "react";
import styled from "styled-components";

// Styled components for the Tab
const StyledTabMenu = styled.div`
  display: flex;
  border-bottom: 2px solid #ccc;
  margin-bottom: 1rem;
`;

const StyledTabMenuItem = styled.div<{ active: boolean }>`
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-bottom: ${({ active }) => (active ? "2px solid blue" : "none")};
  color: ${({ active }) => (active ? "blue" : "black")};
  &:hover {
    background-color: #f0f0f0;
  }
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StyledTabPane = styled.div<{ active: boolean }>`
  display: ${({ active }) => (active ? "block" : "none")};
  padding: 1rem;
`;

const StyledTabContainer = styled.div`
  width: 100%;
`;

// Define a generic interface for the TabComponent
interface TabComponentProps {
  activeIndex: number; // The active tab's index
  onTabChange: (activeIndex: number) => void; // Handler for tab change
  panes: {
    menuItem: string | { key: string; icon?: React.ReactNode; content: React.ReactNode }; // menuItem can be a string or an object
    render?: () => React.ReactNode; // Function that returns the content of the tab
  }[]; // Array of panes for each tab
  menuProps?: any; // Additional props to customize the tab menu
  style?: React.CSSProperties;
  className?: string;
}

const TabComponent: React.FC<TabComponentProps> = ({
  activeIndex,
  onTabChange,
  panes,
  menuProps = { secondary: true, pointing: true },
  style,
  className,
}) => {
  return (
    <StyledTabContainer style={style} className={className}>
      <StyledTabMenu>
        {panes.map((pane, index) => (
          <StyledTabMenuItem
            key={typeof pane.menuItem === "string" ? pane.menuItem : pane.menuItem.key}
            active={activeIndex === index}
            onClick={() => onTabChange(index)}
          >
            {/* Render the menuItem content */}
            {typeof pane.menuItem === "string" ? (
              pane.menuItem
            ) : (
              <>
                {pane.menuItem.icon} {/* Render the icon if provided */}
                {pane.menuItem.content} {/* Render the content */}
              </>
            )}
          </StyledTabMenuItem>
        ))}
      </StyledTabMenu>
      {panes.map((pane, index) => (
        <StyledTabPane key={index} active={activeIndex === index}>
          {pane.render ? pane.render() : null} {/* Render the content of the pane */}
        </StyledTabPane>
      ))}
    </StyledTabContainer>
  );
};

export default TabComponent;
// import React from "react";
// import { Tab } from "semantic-ui-react";

// // Define a generic interface for the TabComponent
// interface TabComponentProps {
//   activeIndex: number; // The active tab's index
//   onTabChange: (activeIndex: number) => void; // Handler for tab change
//   panes: { menuItem: React.ReactNode; render?: React.ReactNode }[]; // Array of panes for each tab
//   menuProps?: any; // Additional props to customize the tab menu
//   style?: React.CSSProperties; // Optional styles for customization
//   className?: any
// }

// const TabComponent: React.FC<TabComponentProps> = ({
//   activeIndex,
//   onTabChange,
//   panes,
//   menuProps = { secondary: true, pointing: true },
//   style,
//   className
// }) => {
//   return (
//     <div
//       style={style}
//       className={className}
//     >
//       <Tab
//         menu={menuProps}
//         panes={panes as any}
//         activeIndex={activeIndex}
//         onTabChange={(_, data) => onTabChange(data.activeIndex as number)}
//       />
//     </div>
//   );
// };

// export default TabComponent;
