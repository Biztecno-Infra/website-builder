import React, { useState } from "react";
import styled from "styled-components";
import { Input } from "@components/lib";
import SvgIcon from "@components/SvgIcon";
import ModalOverlay from "@components/lib/ModalOverlay";

const Title = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: left;
`;

const Subtitle = styled.div`
  font-size: 1.12rem;
  margin-bottom: 20px;
  text-align: left;
`;

const EmailList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
`;

const EmailTag = styled.div`
  background: #008080;
  color: white;
  padding: 4px;
  border-radius: 5px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Button = styled.button<{ primary?: boolean }>`
  width: 48%;
  padding: 10px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  background: ${(props) => (props.primary ? "#008080" : "#ddd")};
  color: ${(props) => (props.primary ? "white" : "black")};
`;

interface SendTestModalProps {
  onClose: () => void;
  onSend: (emails: string[]) => void;
}

const SendTestModal: React.FC<SendTestModalProps> = ({ onClose, onSend }) => {
  const [emails, setEmails] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && inputValue.trim() && emails.length < 5) {
      setEmails([...emails, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeEmail = (email: string) => {
    setEmails(emails.filter((e) => e !== email));
  };
  return (
    <ModalOverlay onClose={onClose}>
      <Title>Send Test</Title>
      <Subtitle>Enter email below and press enter after each email (up to 5 emails)</Subtitle>

      <Input
        name="email"
        value={inputValue}
        placeholder="Enter email here"
        onChange={(name, value) => setInputValue(value as string)}
        onKeyDown={handleKeyDown}
        onBlur={() => { }}
        type="email"
        containerStyle={{marginBottom: 10}}
      />

      <EmailList>
        {emails.map((email) => (
          <EmailTag key={email}>
            {email}
            <SvgIcon
              name="ClearEmail"
              hover
              onClick={() => removeEmail(email)}
              svgStyle={{marginLeft: 5}}
            />
          </EmailTag>
        ))}
      </EmailList>
      <ButtonContainer>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          primary
          disabled={emails.length === 0}
          onClick={() => onSend(emails)}
        >
          Export
        </Button>
      </ButtonContainer>
    </ModalOverlay>
  );
};

export default SendTestModal;