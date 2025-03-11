import { useCallback, useState } from "react";
import update from "immutability-helper";
import { html as beautifyHtml } from "js-beautify";

import {
  getDefaultBlockProperties,
  initialGlobalStyle,
} from "@utils/constant";
import {
  Block,
  IGridCellProps,
  IBlockContext,
  IBlocksState,
  GlobalStyles,
  RootLayout,
} from "../types";
import { generateUniqueId } from "@utils/common";
import { jsonToBlocks, processBlock } from "utils";
import { convertToHtml, tableCommonStyle } from "@utils/jsonToHtml";
import { BlockType , ScreenViews } from "enum";

const initializeBlock = (
  block: Block
): { defaultBlock: Block; extraBlocks: { [key: string]: Block } } => {
  const { type } = block;
  const extraBlocks: { [key: string]: any } = {};
  let properties = getDefaultBlockProperties(type);

  if (type === BlockType.GRID) {
    [...new Array(properties.columns)].forEach((value) => {
      const blockID = generateUniqueId();
      (properties as any).childBlocks.push(blockID);

      extraBlocks[blockID] = {
        type: BlockType.GRIDCELL,
        id: blockID,
        parentId: block.id,
        ...getDefaultBlockProperties(BlockType.GRIDCELL),
      };
    });
  }

  return { defaultBlock: { ...block, ...properties }, extraBlocks };
};

const getDistributtedLength = (length: number): Array<number> => {
  return Array.from({ length }, () => 100 / length);
};

export const useBlocks = (): IBlockContext => {
  const [selectedBlock, setSelectedBlock] = useState<Block | RootLayout | null>(
    null
  );
  const [globalStyles, setGlobalStyles] =
    useState<GlobalStyles>(initialGlobalStyle);
  const [selectedView, setSelectedView] = useState<ScreenViews>(
    ScreenViews.DESKTOP
  ); // Default to Desktop

  const [blocks, setBlocks] = useState<IBlocksState>({});
  const [rootBlockOrder, setRootBlockOrder] = useState<string[]>([]);

  const updateGlobalStyles = (updatedStyles: any) => {
    setGlobalStyles(updatedStyles);
  };

  const updateBlock = (blockId: any, property: any, value: any) => {
    setBlocks((prevBlocks) => {
      const block = prevBlocks[blockId] as any;
      if (!block) return prevBlocks;

      if (block.type === BlockType.GRID && property === "columns") {
        const { columns: prevColumns, childBlocks = [] } = block;
        const newColumns = value;
        const columnDiff = newColumns - prevColumns;

        if (columnDiff > 0) {
          // Add new grid cells
          const newGridCellIds = Array.from(
            { length: columnDiff },
            generateUniqueId
          );
          const newGridCells = Object.fromEntries(
            newGridCellIds.map((id) => [
              id,
              {
                $set: {
                  id,
                  type: BlockType.GRIDCELL,
                  parentId: blockId,
                  childBlocks: [],
                },
              },
            ])
          );

          return update(prevBlocks, {
            [blockId]: {
              columns: { $set: newColumns },
              childBlocks: { $push: newGridCellIds },
            },
            ...newGridCells,
          });
        } else if (columnDiff < 0) {
          const updatedGridCells = childBlocks.slice(0, columnDiff);
          const removedGridCells = childBlocks.slice(columnDiff);
          const removeUpdates = Object.fromEntries(
            removedGridCells.map((id: any) => [id, { $unset: [id] }])
          );

          return update(prevBlocks, {
            [blockId]: {
              columns: { $set: newColumns },
              childBlocks: { $set: updatedGridCells },
            },
            ...removeUpdates,
          });
        }
      }
      return update(prevBlocks, {
        [blockId]: { [property]: { $set: value } },
      });
    });
  };

  const onDeleteBlock = (blockId: string) => {
    const deleteBlock = blocks[blockId];
    setBlocks((prevBlocks) => {
      let updatedBlocks = update(prevBlocks, { $unset: [blockId] });

      if (deleteBlock.parentId) {
        updatedBlocks = update(updatedBlocks, {
          [deleteBlock.parentId]: {
            childBlocks: {
              $apply: (childBlocks: string[]) =>
                childBlocks.filter((id) => id !== blockId),
            },
          },
        });
      }

      return updatedBlocks;
    });

    if (!deleteBlock.parentId) {
      setRootBlockOrder((prevOrder) =>
        prevOrder.filter((id) => id !== blockId)
      );
    }
  };

  const handleJsonUpload = (jsonData: any) => {
    const { blocks, rootBlock } = jsonToBlocks(jsonData);
    const { childrenIds, style } = rootBlock.data || {};
    const rootOrder = childrenIds || [];
    setBlocks(blocks);
    setGlobalStyles(style);
    setRootBlockOrder(rootOrder);
  };

  const handleSwappingV2 = (dragSrc: any, dropAreaId: string) => {
    setBlocks((prvsBlockState) => {
      const insertOrDeleteBlock = (
        blockId: string,
        {
          deleteIndex,
          insertIndex,
          insertValue,
        }: { deleteIndex?: number; insertIndex?: number; insertValue?: string }
      ) => {
        const operations: any = [];
        if (deleteIndex !== undefined && deleteIndex >= 0) {
          operations.push([deleteIndex, 1]);
        }

        if (insertIndex !== undefined && insertIndex >= 0) {
          operations.push([insertIndex, 0, insertValue]);
        }

        prvsBlockState = update(prvsBlockState, {
          [blockId]: {
            childBlocks: {
              $splice: operations,
            },
          },
        });
      };

      const updateParentOfBlock = (blockId: string, parentId: string) => {
        prvsBlockState = update(prvsBlockState, {
          [blockId]: {
            parentId: { $set: parentId },
          },
        });
      };

      const createEmptyGridCell = (blockId: string) => {
        const newGridCellBlock: any = {
          type: BlockType.GRIDCELL,
          id: generateUniqueId(),
          parentId: blockId,
          ...getDefaultBlockProperties(BlockType.GRIDCELL),
        };

        prvsBlockState = update(prvsBlockState, {
          [blockId]: {
            childBlocks: { $push: [newGridCellBlock.id] },
          },
          [newGridCellBlock.id]: { $set: newGridCellBlock },
        });
      };

      const dropBlock = dropAreaId ? prvsBlockState[dropAreaId] : undefined;
      const dropBlockParent = dropBlock?.parentId
        ? prvsBlockState[dropBlock.parentId]
        : undefined;
      const dragBlock = prvsBlockState[dragSrc.id];
      const dragBlockParent = dragBlock.parentId
        ? prvsBlockState[dragBlock.parentId]
        : undefined;
      const dropNodeIndex = dropBlockParent
        ? dropBlockParent.childBlocks?.findIndex((id) => id === dropBlock?.id)
        : 0;
      const dragNodeIndex = dragBlockParent
        ? dragBlockParent.childBlocks?.findIndex((id) => id === dragBlock?.id)
        : 0;

      if (dragBlock?.parentId) {
        // cell is picked from any grid or grid cell

        if (dropBlock?.parentId) {
          if (dragBlock.parentId === dropBlock.parentId) {
            // shuffling in grid or inside the grid cell
            insertOrDeleteBlock(dropBlock.parentId, {
              deleteIndex: dragNodeIndex,
              insertIndex: dropNodeIndex,
              insertValue: dropBlockParent?.childBlocks[dragNodeIndex] || "",
            });
          } else {
            // drag to other grid or grid cell

            if (
              (dropBlockParent?.type === BlockType.GRIDCELL &&
                dragBlockParent?.type === BlockType.GRIDCELL) ||
              (dragBlock.type === BlockType.GRIDCELL &&
                dropBlock?.type === BlockType.GRIDCELL)
            ) {
              // we are shfiting the elements of grid cell from one to another
              insertOrDeleteBlock(dropBlock.parentId, {
                insertIndex: dropNodeIndex,
                insertValue: dragBlock.id,
              });

              insertOrDeleteBlock(dragBlock.parentId, {
                deleteIndex: dragNodeIndex,
              });
              updateParentOfBlock(dragBlock.id, dropBlock.parentId);

              if (
                prvsBlockState[dragBlock.parentId]?.type === BlockType.GRID &&
                prvsBlockState[dragBlock.parentId].childBlocks?.length === 0
              ) {
                // create one empty grid cell
                createEmptyGridCell(dragBlock.parentId);
              }

              // updating the cell count
              prvsBlockState = update(prvsBlockState, {
                [dropBlock.parentId]: {
                  columns: {
                    $set: prvsBlockState[dropBlock.parentId].childBlocks.length,
                  },
                  cellWidths: {
                    $set: getDistributtedLength(
                      prvsBlockState[dropBlock.parentId].childBlocks.length
                    ),
                  },
                },
                [dragBlock.parentId]: {
                  columns: {
                    $set: prvsBlockState[dragBlock.parentId].childBlocks.length,
                  },
                  cellWidths: {
                    $set: getDistributtedLength(
                      prvsBlockState[dragBlock.parentId].childBlocks.length
                    ),
                  },
                },
              });
            } else if (
              dragBlock.type !== BlockType.GRIDCELL &&
              dropBlock?.type === BlockType.GRIDCELL
            ) {
              // when we select any text and send that drop over the grid which is already a part of grid cell

              insertOrDeleteBlock(dropBlock.id, {
                insertIndex: dropBlock.childBlocks.length,
                insertValue: dragBlock.id,
              });
              updateParentOfBlock(dragBlock.id, dropBlock.id!);
              insertOrDeleteBlock(dragBlock.parentId, {
                deleteIndex: dragNodeIndex,
              });
            } else {
              console.error("corner case need to handle");
            }
          }
        } else {
          // we are dropping the block on root

          const isGridCell = dragBlock.type === BlockType.GRIDCELL;

          const newGridBlock = isGridCell
            ? {
                type: BlockType.GRID,
                id: generateUniqueId(),
                parentId: undefined,
                ...getDefaultBlockProperties(BlockType.GRID),
                columns: 1,
                cellWidths: [100],
                childBlocks: [dragBlock.id],
              }
            : undefined;

          setRootBlockOrder((prevs) => {
            const dropNodeIndex = dropBlock?.id
              ? prevs.findIndex((id) => id === dropBlock?.id)
              : prevs.length;
            return update(prevs, {
              $splice: [[dropNodeIndex, 0, newGridBlock?.id || dragBlock.id]],
            });
          });

          if (isGridCell && newGridBlock) {
            // deleting that node from drag parent and append them in root
            insertOrDeleteBlock(dragBlock.parentId, {
              deleteIndex: dragNodeIndex,
            });
            updateParentOfBlock(dragBlock.id, newGridBlock?.id);
            prvsBlockState = update(prvsBlockState, {
              [newGridBlock.id]: { $set: newGridBlock },
            });

            if (
              prvsBlockState[dragBlock.parentId]?.type === BlockType.GRID &&
              prvsBlockState[dragBlock.parentId].childBlocks?.length === 0
            ) {
              // create one empty grid cell
              createEmptyGridCell(dragBlock.parentId);
            }

            // updating the cell count
            prvsBlockState = update(prvsBlockState, {
              [dragBlock.parentId]: {
                columns: {
                  $set: prvsBlockState[dragBlock.parentId].childBlocks.length,
                },
                cellWidths: {
                  $set: getDistributtedLength(
                    prvsBlockState[dragBlock.parentId].childBlocks.length
                  ),
                },
              },
            });
          } else {
            insertOrDeleteBlock(dragBlock.parentId, {
              deleteIndex: dragNodeIndex,
            });
            updateParentOfBlock(dragBlock.id, undefined!);
          }
        }
      } else {
        // it is picked from root
        if (dropBlock?.parentId) {
          // we are inserting root block in some grid or grid cell

          // delete drag node from root
          setRootBlockOrder((prevs) => {
            const dragNodeIndex = prevs.findIndex((id) => id === dragBlock.id);
            return update(prevs, {
              $splice: [[dragNodeIndex, 1]],
            });
          });

          const isGridCell = dropBlock?.type === BlockType.GRIDCELL;

          insertOrDeleteBlock(isGridCell ? dropBlock.id : dropBlock.parentId, {
            insertIndex: isGridCell
              ? dropBlock.childBlocks.length
              : dropNodeIndex,
            insertValue: dragBlock.id,
          });
          updateParentOfBlock(
            dragBlock.id,
            isGridCell ? dropBlock.id : dropBlock.parentId
          );
        } else {
          // we are shuffline in root
          setRootBlockOrder((prevs) => {
            const dropNodeIndex = dropBlock?.id
              ? prevs.findIndex((id) => id === dropBlock?.id)
              : prevs.length;
            const dragNodeIndex = prevs.findIndex((id) => id === dragBlock?.id);
            const valueAtDragIndex = prevs[dragNodeIndex];
            return update(prevs, {
              $splice: [
                [dragNodeIndex, 1],
                [dropNodeIndex, 0, valueAtDragIndex],
              ],
            });
          });
        }
      }
      return prvsBlockState;
    });
  };

  const handleInsertion = (dragSrc: any, dropAreaId: string) => {
    const blockID = generateUniqueId();
    const blockProprtys = {
      type: dragSrc.type as BlockType,
      id: blockID,
      parentId: undefined,
    };
    const { defaultBlock, extraBlocks } = initializeBlock(
      blockProprtys as Block
    );

    setBlocks((prevsBlocks) => {
      const dropBlock = dropAreaId ? prevsBlocks[dropAreaId] : undefined;

      if (dropBlock) {
        if (dropBlock?.type === BlockType.GRIDCELL) {
          // "Drop in grid cell empty";
          prevsBlocks = update(blocks, {
            [dropBlock.id]: { childBlocks: { $push: [blockID] } },
            [blockID]: { $set: { ...defaultBlock, parentId: dropBlock.id } },
          });
        } else if (dropBlock.parentId) {
          // "Drop in grid cell with childrens";
          const dropBlockParent = prevsBlocks[dropBlock.parentId];
          if (dropBlockParent?.type === BlockType.GRIDCELL) {
            const dropNodeIndex = (
              dropBlockParent as IGridCellProps
            ).childBlocks.findIndex((id) => dropBlock.id === id);
            prevsBlocks = update(blocks, {
              [dropBlockParent.id]: {
                childBlocks: { $splice: [[dropNodeIndex, 0, blockID]] },
              },
              [blockID]: {
                $set: { ...defaultBlock, parentId: dropBlockParent.id },
              },
            });
          } else {
            console.error("It is not a nested cell");
          }
        } else {
          // "Drop on block which has no parent";
          prevsBlocks[blockID] = defaultBlock;
          const indexOfDropArea = rootBlockOrder.findIndex(
            (value) => value === dropBlock.id
          );

          setRootBlockOrder((prevs) =>
            update(prevs, {
              $splice: [[indexOfDropArea, 0, blockID]],
            })
          );
        }
      } else {
        // Directly drop to canvas and append at last
        prevsBlocks[blockID] = defaultBlock;
        setRootBlockOrder((prevs) => [...prevs, blockID]);
      }
      return { ...prevsBlocks, ...extraBlocks };
    });
    setSelectedBlock(defaultBlock);
  };

  /**
   *
   * @param targetSrc It can be a block which is already in canvas or it can be section which means i need to insert into canvas
   * @param dropArea it can be root or any block id, if it is root then directly insert as children of root, if it is any block
   *  then check the parent of block if it is grid then insert at bootom of that grid or if it is root then insert in root childrens at last
   */
  const handleDropper = useCallback(
    (dragSrc: any, dropAreaId: string) => {
      if (dragSrc.id) {
        handleSwappingV2(dragSrc, dropAreaId);
      } else if (dragSrc.type) {
        handleInsertion(dragSrc, dropAreaId);
      }
    },
    [blocks, rootBlockOrder]
  );

  const blocksToJson = () => {
    const layout = {
      root: {
        type: "EmailLayout",
        data: {
          style: {
            canvasColor: globalStyles?.canvasColor,
            textColor: globalStyles?.textColor,
            fontFamily: globalStyles?.fontFamily,
            padding: globalStyles?.padding
          },
          childrenIds: rootBlockOrder,
        },
      },
    };

    rootBlockOrder?.forEach((blockId) => {
      const block = blocks[blockId];
      if (block) {
        processBlock(block, blocks, layout, null);
      }
    });

    return layout;
  };

  function convertJsonToHtml(jsonData: any) {
    const rootData = jsonData?.root?.data;
    const blocksHtml = rootData?.childrenIds
      .map((childId: string) => convertToHtml(jsonData[childId], jsonData))
      .join("");
    const rawHtml = `
    <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Layout</title>
        <style>
          @media screen and (max-width: 600px) {
            .ebr-table-wrapper {
              width: 360px !important;
              max-width: 360px !important;
            }
          }

          @media screen and (min-width: 601px) {
            .ebr-table-wrapper {
              width: 600px !important;
              max-width: 600px !important;
            }
          }
        </style>
      </head>
      <body>
        <table class="ebr-table-wrapper" style="font-family:${globalStyles?.fontFamily}; width:600px; max-width:600px;  margin:0 auto; background-color:${globalStyles?.canvasColor}; color:${globalStyles?.textColor}; ${tableCommonStyle}">
          <tbody>
            <tr>
              <td style="padding:0;">${blocksHtml}</td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>`;
    return beautifyHtml(rawHtml, { indent_size: 2 });
  }

  return {
    setSelectedBlock,
    selectedBlock,
    blocks,
    updateBlock,
    onDeleteBlock,
    handleJsonUpload,
    handleDropper,
    rootBlockOrder,
    updateGlobalStyles,
    blocksToJson,
    convertJsonToHtml,
    globalStyles,
    selectedView,
    setSelectedView,
  };
};
