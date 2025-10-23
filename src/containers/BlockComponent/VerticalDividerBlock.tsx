import Droppable from '@containers/Droppable';
import { convertStringtoStyle } from '@utils/index';
import React, { useCallback } from 'react';
import { useTheme } from 'styled-components';
import { TextAlign, VDividerBlockProps } from 'types';

export const VerticalDividerBlock: React.FC<VDividerBlockProps> = ({
  block,
  handleBlockClick,
  handleDropper,
  isSelected,
}) => {
  const {
    backgroundColor,
    width,
    height,
    alignment,
    padding,
    dividerColor,
    customCss,
    ...rest
  } = block;

  const theme = useTheme();

  const handleDrop = useCallback(
    (item: { type: string; name: string; id: number }) => {
      handleDropper(item, block.id);
    },
    [handleDropper, block.id]
  );

  const convertedStyle = convertStringtoStyle(customCss);

  return (
    <Droppable
      id={`block-${block.id}`}
      accept="BLOCK"
      onDrop={handleDrop}
      style={{
        display: 'flex',
        justifyContent:  'center', // default center horizontally
        alignItems: 'center', // center vertically
        paddingTop: `${padding.top}px`,
        paddingRight: `${padding.right}px`,
        paddingBottom: `${padding.bottom}px`,
        paddingLeft: `${padding.left}px`,
        backgroundColor,
        textAlign: "center",
        outline: `${
          isSelected && block.parentId ? `1px dashed ${theme.colors.primary}` : 'none'
        }`,
        zIndex: isSelected ? 10 : 'auto',
        ...convertedStyle,
        ...rest,
      }}
      onClick={handleBlockClick}
    >
      <hr
        style={{
          height: height || '100px',
          width: width || '2px',
          backgroundColor: dividerColor || '#000',
          border: 'none',
          margin: 0,
        }}
      />
    </Droppable>
  );
};
