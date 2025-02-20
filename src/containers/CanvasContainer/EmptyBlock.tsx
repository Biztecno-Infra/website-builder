import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { SizeEnum } from "@components/SvgIcon/SvgIcon";
import styled from "styled-components";

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
  border-radius: 10px;
  margin-top: 0.5rem;
`;

const MessageText = styled.div`
  font-size: inherit;
  font-size: 11px;
  font-weight:400;
  color: #0B978E;
  padding-bottom: 1rem;
`;

const SvgIconWrapper = styled.div`
padding: 1rem;
`;

const EmptyBlock = ({ text }: any) => {
  return (
    <EmptyBlockContainer>
      <SvgIconWrapper>
        <SvgIcon
          name={CUSTOM_SVG_ICON.EmptyCanvas}
        />
      </SvgIconWrapper>
      <MessageText>{text}</MessageText>
    </EmptyBlockContainer>
  );
};

export default EmptyBlock;
