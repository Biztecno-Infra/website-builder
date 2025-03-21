import React from 'react';
import ModalOverlay from '@components/lib/ModalOverlay';
import styled from 'styled-components';
import SvgIcon, { CUSTOM_SVG_ICON } from '@components/SvgIcon';
import { SizeEnum } from 'enum';

const Title = styled.div`
  font-size: 1rem;
  font-weight: bold;
  text-align: left;
`;

const SubText = styled.div`
  font-size: 11px;
  font-weight: 300;
`;

const SearchContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const SearchInputContainer = styled.div`
  display: flex;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 10px;
  width: 300px;
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  background: transparent;
  font-size: 11px;
  color: #c0c0c0;
  width: 100%;

  &::placeholder {
    color: #c0c0c0;
  }
`;

const CardContainer = styled.div`
  background: white;
  border: none;
  padding: 12px;
  width: 220px;
  cursor: pointer;
`;

const TemplateImageContainer = styled.div`
  position: relative;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;

  &:hover div {
    opacity: 1;
  }
`;

const TemplateImage = styled.img`
  width: 100%;
  border-radius: 12px;
  transition: opacity 0.3s ease-in-out;
`;

const HoverOverlay = styled.div`
  position: absolute;
	border-radius: 12px;
  top: 0;
  left: 0;
  width: 100%;
  height: 219px;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 0.5rem;
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const TemplateTitle = styled.h4`
  margin: 10px 0 4px;
  font-size: 12px;
  color: #111111;
  font-weight: 300;
`;

const AuthorContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Author = styled.div`
  font-size: 11px;
  color: #CCCCCC;
  display: flex;
  align-items: center;
`;
const TemplateListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
	justify-content: start;
  gap: 30px;
  margin-top: 16px;
  max-height: 345px; 
  overflow-y: auto;
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  appearance: none;
  margin-top: 8px;
  height: 18px;
  width: 18px;
  cursor: pointer;
  border: 2px solid #D9D9D9;
  border-radius: 2px;
  display: flex;
  justify-content: center;
  align-items: center;
  
  &:checked {
    background-color: #0B978E;
    border-color: #0B978E;
  }

  &:checked::after {
    content: '✔';
    color: white;
    font-size: 14px;
    font-weight: bold;
  }
`;


const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  border-top: 1px solid #DDDDDD;
  padding-top: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button<{ $primary?: boolean, $buttonWidth?: string }>`
  width: ${(props) => (props.$buttonWidth ? props.$buttonWidth : "15%")};
  padding: 10px;
  margin-right: 10px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  background: ${(props) => (props.$primary ? "#0B978E" : "#ddd")};
  color: ${(props) => (props.$primary ? "white" : "black")};

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;


interface TemplateCardProps {
  imageSrc: string;
  title: string;
  author: string;
  onPreview: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ imageSrc, title, author, onPreview }) => {
  return (
    <CardContainer>
      <TemplateImageContainer>
        <TemplateImage src={imageSrc} height={"219px"} width={"209px"} alt="Template Preview" />
        <HoverOverlay>
          <Button $primary $buttonWidth={'50%'} onClick={onPreview}>Preview</Button>
        </HoverOverlay>
      </TemplateImageContainer>
      <ContentContainer>
        <TitleContainer>
          <TemplateTitle>{title}</TemplateTitle>
          <AuthorContainer>
            <SvgIcon
              name={CUSTOM_SVG_ICON.Globe}
              svgStyle={{
                paddingRight: '0.5rem',
                marginTop: '0.25rem',
              }}
              size={SizeEnum.Small}
            />
            <Checkbox />
          </AuthorContainer>
        </TitleContainer>
        <AuthorContainer>
          <SvgIcon name={CUSTOM_SVG_ICON.UserIcon} svgStyle={{ paddingRight: '0.75rem' }} />
          <Author>{author}</Author>
        </AuthorContainer>
      </ContentContainer>
    </CardContainer>
  );
};
interface ImportTemplateModalProps {
  onClose?: () => void;
  onPreview: (template: { imageSrc: string; title: string; author: string }) => void;
}

const ImportTemplateModal: React.FC<ImportTemplateModalProps> = ({ onClose, onPreview }) => {

  const templates = [
    {
      imageSrc: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEmp3R8ynAPEGVeHz0qCFyFoZkGdA20FkxgA&s",
      title: "Earth Day",
      author: "Harpreet Singh",
    },
    {
      imageSrc: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEmp3R8ynAPEGVeHz0qCFyFoZkGdA20FkxgA&s",
      title: "Nature Theme",
      author: "John Doe",
    },
  ];

  return (
    <ModalOverlay onClose={onClose} customWidth="810px" >
      <Title>Export</Title>

      <SearchContainer>
        <SubText>Select from the below templates to import</SubText>
        <SearchInputContainer>
          <SvgIcon name={CUSTOM_SVG_ICON.SearchIcon} />
          <SearchInput type="text" placeholder="Search Templates" />
        </SearchInputContainer>
      </SearchContainer>

      <TemplateListContainer>
        {templates.map((template, index) => (
          <TemplateCard
            key={index}
            imageSrc={template.imageSrc}
            title={template.title}
            author={template.author}
            onPreview={() => onPreview(template)}
          />
        ))}
      </TemplateListContainer>

      <ButtonContainer>
        <Button onClick={onClose}>Cancel</Button>
        <Button $primary onClick={() => ('')}>
          Import
        </Button>
      </ButtonContainer>
    </ModalOverlay>
  );
};

export default ImportTemplateModal;
