import Droppable from "@containers/Droppable";
import styled from "styled-components";

export const BlockContainer = styled.div<{
  isDragging: boolean;
  cursor: string;
}>`
  opacity: ${({ isDragging }) => (isDragging ? 0.5 : 1)};
  cursor: ${({ cursor }) => cursor};
  padding-left: 8px;
`;

export const BlockContent = styled.div<{ hasChildBlocks: boolean }>`
  cursor: ${({ hasChildBlocks }) => (hasChildBlocks ? "pointer" : "default")};
  display: flex;
  align-items: center;
`;

export const ChildNodesContainer = styled.div`
  padding-left: 8px;
`;

export const BlockContentText = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  color: #006e75;
  width: 100%;
  padding: 0.75rem;
  &:hover {
    background-color: #f5f5f5;
  }
`;

export const BlockTextIcon = styled.div`
  display: flex;
  align-items: center;
`;

export const BlockText = styled.div`
  padding-right: 0.25rem;
`;

export const ExpandIcon = styled.div`
  transform: rotate(270deg);
`;

export const ChevronIcon = styled.span<{ isExpanded: boolean }>`
  margin-right: 10px;
  cursor: pointer;
  font-size: 16px;
  padding-left: 8px;
`;

export const EmptyTreeNodeContainer = styled.div`
  padding-bottom: 50px;
  padding-left: 16px;
  background-color: #f4f4f4;
  border: 1px dashed #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
  cursor: pointer;
`;

export const RootBlockContainer = styled.div<{ isExpanded: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  color: #006e75;
  width: 100%;
  &:hover {
    background-color: #f5f5f5;
  }
`;

export const HeaderContainer = styled.div`
  font-size: ${({ theme }) => theme.fontSize.labelHeader};
  border-bottom: 1px solid #dddddd;
  width: 97%;
  height: 3rem;
  display: flex;
  align-items: center;
  font-weight: 500;
  padding-left: 0.5rem;
`;
