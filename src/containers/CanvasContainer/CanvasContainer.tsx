"use client"

import React, { useCallback, useMemo } from "react"
import BlockComponent from "../BlockComponent"
import Droppable from "../Droppable"
import EmptyBlock from "./EmptyBlock"
import { useBlockHook } from "context/BlockContext"
import styled, { useTheme } from "styled-components"
import type { Block, Padding } from "types"
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon"
import { ScreenViews } from "enum"

// import domtoimage from "dom-to-image";
interface TableWrapperProps {
  $canvasColor: string
  $canvasFont: string
  $canvasFontColor: string
  $canvasPadding: Padding
  $isMobile: boolean
}

const BlockWrapper = styled.div<{ $isSelected: boolean; theme: any }>`
  cursor: pointer;
  border: ${({ $isSelected, theme }) => ($isSelected ? `1px dashed ${theme.colors.primary}` : "none")};
  position: relative;
`

const CanvasDropable = styled.div`
  padding: 3rem;
`

const DeleteWrapper = styled.div`
  position: absolute;
  cursor: pointer;
  right: 28px;
  bottom: 3px;
`

const TrashIconWrapper = styled.div`
  position: absolute;
  top: 0;
  right: -35px;
  border-radius: 50%;
  padding: 5px;
  cursor: pointer;
  z-index: 998;
`

const TableWrapper = styled.table<TableWrapperProps>`
  &.ebr-tableWrapper {
    margin: 0 auto;
    background-color: ${({ $canvasColor }) => $canvasColor};
    font-family: ${({ $canvasFont }) => $canvasFont};
    color: ${({ $canvasFontColor }) => $canvasFontColor};
    // border-collapse: collapse;
    table-layout: fixed;
    width: ${({ $isMobile }) => ($isMobile ? "360px" : "600px")};
    max-width: ${({ $isMobile }) => ($isMobile ? "360px" : "600px")};

    @media screen and (max-width: 600px) {
      width: 360px !important;
      max-width: 360px !important;
    }
  }
`

const Canvas = () => {
  const {
    selectedBlock,
    handleDropper,
    rootBlockOrder,
    setSelectedBlock,
    onDeleteBlock,
    globalStyles,
    selectedView,
    canvasRef,
  } = useBlockHook()

  const theme = useTheme()

  const handleDrop = useCallback(
    (item: { type: string; name: string; id: number }) => {
      requestAnimationFrame(() => {
        handleDropper(item, undefined!)
      })
    },
    [handleDropper],
  )

  const renderBlock = useCallback(
    (blockId: string, index: number) => {
      return (
        <BlockWrapper key={blockId} id={blockId} $isSelected={blockId === (selectedBlock as Block)?.id} theme={theme}>
          <BlockComponent blockId={blockId} />
          {blockId === (selectedBlock as Block)?.id && (
            <TrashIconWrapper
              onClick={(e) => {
                e.stopPropagation()
                onDeleteBlock(blockId)
                setSelectedBlock(null)
              }}
            >
              <DeleteWrapper>
                <SvgIcon name={CUSTOM_SVG_ICON.DeleteBlock} />
              </DeleteWrapper>
            </TrashIconWrapper>
          )}
        </BlockWrapper>
      )
    },
    [selectedBlock, theme, onDeleteBlock, setSelectedBlock],
  )

  const memoizedTableWrapper = useMemo(
    () => (
      <TableWrapper
        className="ebr-tableWrapper"
        $canvasColor={globalStyles.canvasColor}
        $canvasFont={globalStyles.fontFamily}
        $canvasFontColor={globalStyles.textColor}
        $canvasPadding={globalStyles.padding}
        $isMobile={selectedView === ScreenViews.MOBILE}
        ref={canvasRef}
        style={{
          border: globalStyles.borderWidth
            ? `${globalStyles.borderWidth}px ${globalStyles.borderStyle} ${globalStyles.borderColor}`
            : "none",
          borderRadius: globalStyles.borderRadius ? `${globalStyles.borderRadius}px` : "0",
        }}
      >
        <tbody>
          <tr style={{ padding: 0 }}>
            <td
              style={{
                paddingTop: globalStyles?.padding?.top,
                paddingRight: globalStyles?.padding?.right,
                paddingBottom: globalStyles?.padding?.bottom,
                paddingLeft: globalStyles?.padding?.left,
              }}
            >
              {rootBlockOrder.map(renderBlock)}
            </td>
          </tr>
        </tbody>
      </TableWrapper>
    ),
    [globalStyles, selectedView, canvasRef, rootBlockOrder, renderBlock],
  )

  return (
    <Droppable
      accept="BLOCK"
      onDrop={handleDrop}
      style={{
        backgroundColor: theme.canvas.backgroundColor,
        height: "100%",
        fontSize: "1rem",
        width: "calc(100% - 20.4rem)",
        overflowX: "hidden",
        overflowY: "auto",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        fontFamily: globalStyles.fontFamily,
      }}
      onClick={() => setSelectedBlock(null)}
    >
      <CanvasDropable>
        <div
          style={{
            padding: rootBlockOrder.length === 0 ? 15 : 0,
            background: rootBlockOrder.length === 0 ? "#ffffff" : "none",
          }}
        >
          {rootBlockOrder.length > 0 ? (
            memoizedTableWrapper
          ) : (
            <EmptyBlock theme={theme!} text="Drag & drop elements here to start building " />
          )}
        </div>
      </CanvasDropable>
    </Droppable>
  )
}

export default React.memo(Canvas)
