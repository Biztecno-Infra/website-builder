import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import styled from "styled-components";

// Styled Components
const EmptyBlockContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 2rem; /* Assuming text-7 corresponds to 2rem */
`;

const MessageText = styled.div`
  font-size: inherit;
`;

const SvgIconWrapper = styled.div`
  margin-top: 1rem; /* Assuming margin-t-4 corresponds to 1rem */
`;

const EmptyBlock = () => {
  return (
    <EmptyBlockContainer>
      <MessageText>Drag block and drop here</MessageText>
      <SvgIconWrapper>
        <SvgIcon
          name={CUSTOM_SVG_ICON.Plus}
          size={"large"}
        />
      </SvgIconWrapper>
    </EmptyBlockContainer>
  );
};

export default EmptyBlock;
