import styled, { DefaultTheme } from "styled-components";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { Theme } from "react-toastify";

// Styled Components
const EmptyBlockContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 2rem;
  border: 1px dashed #DDDDDD;
  background: #ffffff;
`;

const MessageText = styled.div<{ theme: DefaultTheme }>`
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.primary};
  padding-bottom: 1rem;
  font-family: Montserrat;
`;
const SvgIconWrapper = styled.div`
padding: 1rem;

`;

const EmptyBlock = ({ text , theme}: {text: string , theme: any}) => {
  return (
    <EmptyBlockContainer>
      <SvgIconWrapper>
        <SvgIcon
          name={CUSTOM_SVG_ICON.EmptyCanvas}
        />
      </SvgIconWrapper>
      <MessageText theme={theme}>{text}</MessageText>
    </EmptyBlockContainer>
  );
};

export default EmptyBlock;
