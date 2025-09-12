import styled from "styled-components";

export const BlockContainer = styled.div<{
  $isDragging: boolean;
  cursor: string;
  $isSelected: boolean;
}>`
  opacity: ${({ $isDragging }) => ($isDragging ? 0.5 : 1)};
  cursor: ${({ cursor }) => cursor};
  padding-left: 8px;
  background-color:  ${({ $isSelected }) => ($isSelected ? "#006E75" : "none")};
  color:  ${({ $isSelected }) => ($isSelected ? "#FFFFFF" : "inherit")};
  &:hover {
    ${({ $isSelected }) => !$isSelected && `
      background-color: #f5f5f5;
      `}
}
`;

export const BlockContent = styled.div<{ $hasChildBlocks: boolean }>`
  cursor: ${({ $hasChildBlocks }) => ($hasChildBlocks ? "pointer" : "default")};
  display: flex;
  align-items: center;
  width: 100%;
  
`;

export const ChildNodesContainer = styled.div`
  padding-left: 8px;
`;

export const BlockContentText = styled.div<{
  $isSelected?: boolean;
}>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  color: ${({ theme, $isSelected }) => ($isSelected ? "#f5f5f5" : theme.colors.primary)}; // changed to use theme primary color
  width: 100%;
  padding: 0.75rem 0.5rem;

  &:hover {
    ${({ $isSelected }) => !$isSelected && `
      background-color: #f5f5f5;
      display: flex;
      flex-direction: row;
      align-items: center;
    `}
  }
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

export const RootBlockContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  color: #0B978E;
  width: 100%;
  font-size: 12px;
  &:hover {
    background-color: #f5f5f5;
  }
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
