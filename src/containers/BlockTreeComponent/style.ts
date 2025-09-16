import styled from "styled-components";

export const BlockContainer = styled.div<{
  $isDragging: boolean;
  cursor: string;
  $isSelected: boolean;
  $isAncestor?: boolean;
  $isDescendant?: boolean;
  $hasChildBlocks?: boolean;
}>`
  opacity: ${({ $isDragging }) => ($isDragging ? 0.5 : 1)};
  cursor: ${({ cursor }) => cursor};
  padding-bottom: 2px;
  padding-left: 1px;
  padding-right: 2px;
  background-color: ${({
    $isSelected,
    $isAncestor,
    $isDescendant,
    $hasChildBlocks,
    theme,
  }) => {
    if ($isSelected) return theme.colors.primary;
    if ($isAncestor || $isDescendant) return theme.colors.secondary; // or some lighter blue
    if ($hasChildBlocks) return "#ffffff"; // light green
    return "none";
  }};

  color: ${({ $isSelected }) => ($isSelected ? "#FFFFFF" : "inherit")};
`;

export const BlockContent = styled.div<{ $hasChildBlocks: boolean }>`
  cursor: ${({ $hasChildBlocks }) => ($hasChildBlocks ? "pointer" : "default")};
  display: flex;
  align-items: center;
  width: 100%;
`;

export const BlockContentText = styled.div<{
  $isSelected: boolean;
}>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.75rem 0.5rem;
  color: ${({ theme, $isSelected }) =>
    $isSelected ? "#FFFFFF" : theme.colors.primary};
`;

export const ChildNodesContainer = styled.div`
  padding-left: 1px;
`;

export const BlockTextIcon = styled.div`
  display: flex;
  align-items: center;
`;

export const BlockText = styled.div`
  padding-right: 0.5rem;
`;

export const ExpandIcon = styled.div`
  transform: rotate(270deg);
`;

export const ChevronIcon = styled.samp`
  display: flex;
  flex-direction: row;
  margin-right: 10px;
  cursor: pointer;
  font-size: 16px;
  padding-left: 8px;
`;

export const RootBlockContainer = styled.div<{
  $isSelected?: boolean;
}>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-size: 12px;
  background-color: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.primary : "none"};

  color: ${({ $isSelected }) => ($isSelected ? "#FFFFFF" : "inherit")};
`;

export const HeaderContainer = styled.div`
  font-size: ${({ theme }) => theme.fontSize.labelHeader};
  border-bottom: 1px solid #dddddd;
  width: 97%;
  height: 49px;
  display: flex;
  align-items: center;
  font-weight: bold;
  padding-left: 0.5rem;
`;
