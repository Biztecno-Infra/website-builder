import React, { useState } from "react";
import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: white;
  width: 400px;
  border-radius: 10px;
  padding: 20px;
  position: relative;
  text-align: center;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
`;

const EmailInput = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
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
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 14px;
  cursor: pointer;
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
    <Overlay>
      <ModalContainer>
        <CloseButton onClick={onClose}>×</CloseButton>
        <h2>Send Test</h2>
        <p>Enter email below and press enter after each email (up to 5 emails)</p>
        <EmailInput
          type="email"
          placeholder="Enter email here"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <EmailList>
          {emails.map((email) => (
            <EmailTag key={email}>
              {email} <RemoveButton onClick={() => removeEmail(email)}>×</RemoveButton>
            </EmailTag>
          ))}
        </EmailList>
        <ButtonContainer>
          <Button onClick={onClose}>Cancel</Button>
          <Button primary disabled={emails.length === 0} onClick={() => onSend(emails)}>
            Export
          </Button>
        </ButtonContainer>
      </ModalContainer>
    </Overlay>
  );
};

export default SendTestModal;
