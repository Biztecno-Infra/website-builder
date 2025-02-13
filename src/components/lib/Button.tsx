import styled from "styled-components";

const Button = styled.button`
  background-color: ${({ theme }) => { console.log(theme); return theme.colors.primary}};
  color: white;
  padding: ${({ theme }) => theme.spacing.medium};
  border-radius: ${({ theme }) => theme.borderRadius};
  border: none;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
`;

export {Button};