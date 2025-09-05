import { forwardRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import styled, { createGlobalStyle } from "styled-components";

import PropertyPanel from "@containers/PropertyPanel";
import ElementsPanel from "@containers/ElementsPanel";
import { BlockHookProvider } from "./context/BlockContext";
import { BlockHookRef, Theme } from "./types";
import CustomThemeProvider from "@context/ThemeContext";
import CanvasContainer from "@containers/CanvasContainer";
import HeaderActions from "@containers/HeaderActions";
import "./index.css";

interface Props {
  theme?: Theme;
  onExport: (format: "JSON" | "HTML", data: any) => void;
  onImport: () => void;
}

// 🛡️ Global styles scoped to just .email-template-builder
const ScopedGlobalStyle = createGlobalStyle`
  .email-template-builder {
    font-family: 'Montserrat', sans-serif;
    font-size: 14px;
    box-sizing: border-box;
  }

  .email-template-builder *, 
  .email-template-builder *::before, 
  .email-template-builder *::after {
    box-sizing: inherit;
    font-family: inherit;
  }
`;

const Container = styled.div`
  && {
    display: flex;
    width: 100%;
    height: 100%;
    overflow: hidden;
    padding: 0;
    font-size: 14px;
    font-family: Montserrat, sans-serif;
  }
`;

const MiddleContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: calc(100% - 16.8rem);
  height: 100%;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: calc(100% - 3rem);
`;

const EmailTemplateBuilder = forwardRef<BlockHookRef, Props>(
  ({ theme, onExport, onImport }, ref) => {
function parseGradient(gradient: any) {
  const gradientRegex = /linear-gradient\(([^,]+),\s*(.+)\)/i;
  const match = gradient.match(gradientRegex);
  if (!match) return null;

  const direction = match[1].trim();
  const stopsString = match[2].trim();

  // Split color stops by comma, respecting rgb(), rgba(), etc.
  const stops = [];
  let current = '';
  let depth = 0;

  for (let char of stopsString) {
    if (char === '(') depth++;
    if (char === ')') depth--;
    if (char === ',' && depth === 0) {
      stops.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current) stops.push(current.trim());

  // Parse each stop into color and position
  const parsedStops = stops.map(stop => {
    const parts = stop.match(/(rgba?\([^)]+\)|#[0-9a-fA-F]+|\b[a-zA-Z]+\b)\s*(\d+%?)?/);
    if (!parts) return null;
    return {
      color: parts[1],
      position: parts[2] || null
    };
  }).filter(Boolean);

  return {
    direction,
    colorStops: parsedStops
  };
}

// Example usage
const gradient = "linear-gradient(90deg, RGB(172, 169, 222) 0%, rgba(9,9,121,1) 35%, rgba(0,212,255,1) 100%)";
const parsed = parseGradient(gradient);
console.log(parsed);
    return (
      <DndProvider backend={HTML5Backend}>
        <CustomThemeProvider theme={theme! || {}}>
          <BlockHookProvider ref={ref}>
            <Container className="email-template-builder">
              <ScopedGlobalStyle />
              <ElementsPanel />
              <MiddleContainer>
                <HeaderActions onExport={onExport} onImport={onImport} />
                <ContentWrapper>
                  <CanvasContainer />
                  <PropertyPanel />
                </ContentWrapper>
              </MiddleContainer>
            </Container>
          </BlockHookProvider>
        </CustomThemeProvider>
      </DndProvider>
    );
  }
);

export default EmailTemplateBuilder;
