import { useCallback, useRef, useState } from "react";
import update from "immutability-helper";
import { BlockType, generateUniqueId } from "email-builder-utils";

import { getDefaultBlockProperties, initialGlobalStyle } from "@utils/constant";
import {
  Block,
  IGridCellProps,
  IBlockContext,
  IBlocksState,
  GlobalStyles,
  RootLayout,
} from "../types";
import { jsonToBlocks, processBlock } from "utils";
import { ScreenViews } from "enum";

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
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedBlock, setSelectedBlock] = useState<Block | RootLayout | null>(
    null
  );
  const [globalStyles, setGlobalStyles] =
    useState<GlobalStyles>(initialGlobalStyle);
  const [selectedView, setSelectedView] = useState<ScreenViews>(
    ScreenViews.DESKTOP
  );

  const [blocks, setBlocks] = useState<IBlocksState>({});
  const [rootBlockOrder, setRootBlockOrder] = useState<string[]>([]);

  const past = useRef<
    Array<{
      blocks: IBlocksState;
      rootOrder: string[];
      globalStyles: GlobalStyles;
    }>
  >([]);
  const future = useRef<
    Array<{
      blocks: IBlocksState;
      rootOrder: string[];
      globalStyles: GlobalStyles;
    }>
  >([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  console.log("blocks", blocks, rootBlockOrder, globalStyles);
  const pushToPast = () => {
    console.log(past.current, future.current, "pushToPast");
    const rootBlockOrderNew = [...rootBlockOrder];
    past.current?.push({
      blocks: JSON.parse(JSON.stringify(blocks)),
      rootOrder: [...rootBlockOrderNew],
      globalStyles: JSON.parse(JSON.stringify(globalStyles)),
    });
    future.current = []; // clear redo stack
    setCanUndo(past.current.length > 0);
    setCanRedo(false);
  };

  const undo = () => {
    if (past.current.length === 0) return;

    const previous = past.current.pop()!;
    future.current.push({
      blocks,
      rootOrder: rootBlockOrder,
      globalStyles,
    });

    setBlocks(previous.blocks);
    setRootBlockOrder(previous.rootOrder);
    setGlobalStyles(previous.globalStyles);
    setCanUndo(past.current.length > 0);
    setCanRedo(true);
  };

  const redo = () => {
    if (future.current.length === 0) return;

    const next = future.current.pop()!;
    past.current.push({
      blocks,
      rootOrder: rootBlockOrder,
      globalStyles,
    });

    setBlocks(next.blocks);
    setRootBlockOrder(next.rootOrder);
    setGlobalStyles(next.globalStyles);
    setCanUndo(true);
    setCanRedo(future.current.length > 0);
  };

  const handleImportTemplates = (selectedTemplates: any[]) => {
    selectedTemplates.forEach((template) => {
      const { root, ...otherBlocks } = template.layout;
      const convertedBlocks = jsonToBlocks(template.layout);
      // Append root block to rootBlockOrder
      if (selectedTemplates.length === 1 && rootBlockOrder.length === 0) {
        setGlobalStyles(root.data.style);
      }
      setRootBlockOrder((prevOrder) => [
        ...prevOrder,
        ...(root.data.childrenIds || []),
      ]);

      // Merge the new blocks with the existing blocks
      setBlocks((prevBlocks) => ({
        ...prevBlocks,
        ...convertedBlocks.blocks, // Merging the new blocks
      }));
      pushToPast();
    });
  };

  const updateGlobalStyles = (updatedStyles: any) => {
    pushToPast();
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
        pushToPast();
  };

  const onDeleteBlock = (blockId: string) => {
    const deleteBlock = blocks[blockId];

    if (!deleteBlock) {
      console.warn(`Block with ID ${blockId} does not exist.`);
      return;
    }

    setBlocks((prevBlocks) => {
      let updatedBlocks = update(prevBlocks, { $unset: [blockId] });

      if (deleteBlock?.parentId && updatedBlocks[deleteBlock.parentId]) {
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

    if (!deleteBlock?.parentId) {
      setRootBlockOrder((prevOrder) =>
        prevOrder.filter((id) => id !== blockId)
      );
    }
    pushToPast();
  };

  const handleJsonUpload = (jsonData: any) => {
    try {
      const { blocks, rootBlock } = jsonToBlocks(jsonData);
      const { childrenIds, style } = rootBlock.data || {};
      const rootOrder = childrenIds || [];

      setBlocks(blocks);
      setGlobalStyles(style);
      setRootBlockOrder(rootOrder);

      return { success: true, message: "Upload successful" };
    } catch (error) {
      console.error("Error uploading JSON:", error);
      return { success: false, message: "Error uploading JSON", error };
    }
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
    pushToPast();
  };

  const handleInsertion = (dragSrc: any, dropAreaId: string) => {
    const blockID = generateUniqueId();
    const blockProps = {
      type: dragSrc.type as BlockType,
      id: blockID,
      parentId: undefined,
    };
    const { defaultBlock, extraBlocks } = initializeBlock(blockProps as Block);

    setBlocks((prevBlocks) => {
      const dropBlock = dropAreaId ? prevBlocks[dropAreaId] : undefined;
      let newBlocks = { ...prevBlocks };

      if (dropBlock) {
        if (dropBlock.type === BlockType.GRIDCELL) {
          // Drop into empty grid cell
          newBlocks = update(newBlocks, {
            [dropBlock.id]: { childBlocks: { $push: [blockID] } },
            [blockID]: { $set: { ...defaultBlock, parentId: dropBlock.id } },
          });
        } else if (dropBlock.parentId) {
          const parent = prevBlocks[dropBlock.parentId];
          if (parent?.type === BlockType.GRIDCELL) {
            const index = parent.childBlocks.findIndex(
              (id) => id === dropBlock.id
            );
            newBlocks = update(newBlocks, {
              [parent.id]: {
                childBlocks: { $splice: [[index, 0, blockID]] },
              },
              [blockID]: {
                $set: { ...defaultBlock, parentId: parent.id },
              },
            });
          } else {
            console.error("Unsupported block drop scenario");
          }
        } else {
          // Drop on a top-level block (no parent)
          newBlocks[blockID] = defaultBlock;
          const index = rootBlockOrder.findIndex((id) => id === dropBlock.id);
          setRootBlockOrder((prev) =>
            update(prev, {
              $splice: [[index, 0, blockID]],
            })
          );
        }
      } else {
        // Dropped on empty canvas
        newBlocks[blockID] = defaultBlock;
        setRootBlockOrder((prev) => [...prev, blockID]);
      }

      return { ...newBlocks, ...extraBlocks };
    });

    setSelectedBlock(defaultBlock);
    pushToPast();
  };

  /**
   *
   * @param targetSrc It can be a block which is already in canvas or it can be section which means i need to insert into canvas
   * @param dropArea it can be root or any block id, if it is root then directly insert as children of root, if it is any block
   *  then check the parent of block if it is grid then insert at bootom of that grid or if it is root then insert in root childrens at last
   */
  const handleDropper = useCallback(
    (dragSrc: any, dropAreaId: string) => {
      //  pushToPast();
      console.log("handleDropper", dragSrc, dropAreaId);
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
          style: globalStyles,
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
    globalStyles,
    selectedView,
    setSelectedView,
    handleImportTemplates,
    canvasRef,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};
