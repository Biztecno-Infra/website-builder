import React, { useState } from 'react';
import ModalOverlay from '@components/lib/ModalOverlay';
import SvgIcon, { CUSTOM_SVG_ICON } from '@components/SvgIcon';
import styled from 'styled-components';
import { SizeEnum } from 'enum';

const Title = styled.div`
  font-size: 1rem;
  font-weight: bold;
  text-align: left;
  padding-top: 0.5rem;
`;

const PreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const MainPreviContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const AuthorContainer = styled.div`
  display: flex;
  align-items: center;
  padding-top: 0.25rem;
`;

const Author = styled.div`
  font-size: 11px;
  color: #cccccc;
  display: flex;
  align-items: center;
`;

const TemplatePreview = styled.div`
  padding: 1rem;
  margin: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 75%;
  max-height: 365px;
  overflow-y: auto;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  border-top: 1px solid #dddddd;
  padding-top: 1rem;
  margin-top: 1rem;
`;

const MiniTemplateContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  width: 80%;
  max-height: 315px;
  overflow-y: auto;
`;

const MoreTemplateText = styled.div`
  font-size: 10px;
  font-weight: 500;
  text-align: left;
  padding-top: 1rem;
`;

const MiniPreviewContainer = styled.div`
  padding-top: 1rem;
  padding-right: 1.5rem;
`;

const MiniPreviewTitle = styled.div`
  text-align: start;
`;

const MiniPreviewImage = styled.img`
  height: 102px;
  width: 98px;
  display: flex;
  align-items: start;
  cursor: pointer; 
`;

const Button = styled.button<{ $primary?: boolean; $buttonWidth?: string }>`
  width: ${(props) => (props.$buttonWidth ? props.$buttonWidth : '15%')};
  padding: 10px;
  margin-right: 10px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  background: ${(props) => (props.$primary ? '#0B978E' : '#ddd')};
  color: ${(props) => (props.$primary ? 'white' : 'black')};

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

interface PerviewTemplateModalProps {
	onClose: () => void;
	template: {
		imageSrc: string;
		title: string;
		author: string;
	};
}

const MiniPreviewTemplate: React.FC<{
	imageUrl: string;
	onClick: (url: string) => void;
}> = ({ imageUrl, onClick }) => {
	return (
		<MiniPreviewContainer>
			<MiniPreviewImage
				src={imageUrl}
				onClick={() => onClick(imageUrl)}
			/>
			<MiniPreviewTitle>Earth Day</MiniPreviewTitle>
			<AuthorContainer>
				<SvgIcon
					name={CUSTOM_SVG_ICON.UserIcon}
					svgStyle={{ paddingRight: '0.5rem' }}
				/>
				<Author>Harpreet Singh</Author>
			</AuthorContainer>
		</MiniPreviewContainer>
	);
};

const PerviewTemplateModal: React.FC<PerviewTemplateModalProps> = ({
	onClose, template
}) => {
	const [selectedImage, setSelectedImage] = useState(
		'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEmp3R8ynAPEGVeHz0qCFyFoZkGdA20FkxgA&s'
	);

	const handleImageClick = (url: string) => {
		setSelectedImage(url);
	};

	return (
		<ModalOverlay onClose={onClose} customWidth="810px" >
			<MainPreviContainer>
				<PreviewContainer>
					<Title>Import Template</Title>
					<Title>Environment Day Template</Title>
					<AuthorContainer>
						<AuthorContainer>
							<SvgIcon
								name={CUSTOM_SVG_ICON.UserIcon}
								svgStyle={{ paddingRight: '0.5rem' }}
							/>
							<Author>Harpreet Singh</Author>
						</AuthorContainer>
						<AuthorContainer>
							<SvgIcon
								name={CUSTOM_SVG_ICON.Globe}
								svgStyle={{
									paddingRight: '0.5rem',
									marginLeft: '0.75rem',
								}}
								size={SizeEnum.Mini}
							/>
							<Author>Public Publications</Author>
						</AuthorContainer>
					</AuthorContainer>
					<MoreTemplateText>More Templates ▾</MoreTemplateText>
					<MiniTemplateContainer>
						<MiniPreviewTemplate
							imageUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-K2Qe5N26HdG0jQWBEHxZYETyuxdBDUfhzA&s"
							onClick={handleImageClick}
						/>
						<MiniPreviewTemplate
							imageUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEmp3R8ynAPEGVeHz0qCFyFoZkGdA20FkxgA&s"
							onClick={handleImageClick}
						/>
						<MiniPreviewTemplate
							imageUrl="https://via.placeholder.com/150"
							onClick={handleImageClick}
						/>
						<MiniPreviewTemplate
							imageUrl="https://via.placeholder.com/200"
							onClick={handleImageClick}
						/>
					</MiniTemplateContainer>
				</PreviewContainer>

				<TemplatePreview>
					<img src={selectedImage} alt="Template Preview" />
				</TemplatePreview>
			</MainPreviContainer>

			<ButtonContainer>
				<Button onClick={onClose}>Cancel</Button>
				<Button $primary onClick={() => console.log('Import clicked')}>
					Import
				</Button>
			</ButtonContainer>
		</ModalOverlay>
	);
};

export default PerviewTemplateModal;