import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import update from "immutability-helper";
import { BlockType, generateUniqueId } from "email-builder-utils";
import { getDefaultBlockProperties, initialGlobalStyle } from "@utils/constant";
import {
  Block,
  IBlockContext,
  IBlocksState,
  GlobalStyles,
  RootLayout,
} from "../types";
import { jsonToBlocks, processBlock } from "utils";
import { ScreenViews } from "enum";
import { useUndoRedo } from "./useUndoRedo";

const initializeBlock = (
  block: Block
): { defaultBlock: Block; extraBlocks: { [key: string]: Block } } => {
  const { type } = block;
  const extraBlocks: { [key: string]: any } = {};
  let properties = getDefaultBlockProperties(type);

  if (type === BlockType.GRID) {
    [...new Array(properties.columns)].forEach(() => {
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
  const HISTORY_COALESCE_MS = 250;

  const [globalStyles, setGlobalStyles] =
    useState<GlobalStyles>(initialGlobalStyle);
  const [selectedView, setSelectedView] = useState<ScreenViews>(
    ScreenViews.DESKTOP
  );

  const [blocks, setBlocks] = useState<IBlocksState>({});
  const [rootBlockOrder, setRootBlockOrder] = useState<string[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<
    string | "EmailLayout" | null
  >(null);
  const isApplyingHistory = useRef<boolean>(false);
  const [undoLocked, setUndoLocked] = useState<boolean>(false);

  const selectedBlock: Block | RootLayout | null = useMemo(() => {
    if (selectedBlockId === "EmailLayout") {
      return {
        type: "EmailLayout",
        data: { style: globalStyles, childrenIds: rootBlockOrder },
      } as RootLayout;
    }
    if (selectedBlockId) {
      return blocks[selectedBlockId] || null;
    }
    return null;
  }, [selectedBlockId, blocks, globalStyles, rootBlockOrder]);

  const {
    push,
    undo: undoHistory,
    redo: redoHistory,
    canUndo,
    canRedo,
  } = useUndoRedo({
    blocks,
    rootOrder: rootBlockOrder,
    globalStyles,
  });

  // Debounced automatic history push
  useEffect(() => {
    if (isApplyingHistory.current) return;
    const handle = window.setTimeout(() => {
      push({ blocks, rootOrder: rootBlockOrder, globalStyles });
    }, HISTORY_COALESCE_MS);
    return () => window.clearTimeout(handle);
  }, [blocks, rootBlockOrder, globalStyles, push]);

  const undo = async () => {
    if (!canUndo) return;
    const prevState = await undoHistory({ blocks, rootOrder: rootBlockOrder, globalStyles });
    if (!prevState) return;

    isApplyingHistory.current = true;
    setBlocks(prevState.blocks);
    setRootBlockOrder(prevState.rootOrder);
    setGlobalStyles(prevState.globalStyles);
    setTimeout(() => {
      isApplyingHistory.current = false;
    }, 0);
  };

  const redo = async () => {
    if (!canRedo) return;
    const nextState = await redoHistory({ blocks, rootOrder: rootBlockOrder, globalStyles });
    if (!nextState) return;

    isApplyingHistory.current = true;
    setBlocks(nextState.blocks);
    setRootBlockOrder(nextState.rootOrder);
    setGlobalStyles(nextState.globalStyles);
    setTimeout(() => {
      isApplyingHistory.current = false;
    }, 0);
  };

  const handleImportTemplates = useCallback(
    (selectedTemplates: any[]) => {
      const processedData = selectedTemplates.reduce(
        (acc, template) => {
          const { root } = template.layout;
          const convertedBlocks = jsonToBlocks(template.layout);

          return {
            blocks: { ...acc.blocks, ...convertedBlocks.blocks },
            childrenIds: [...acc.childrenIds, ...(root.data.childrenIds || [])],
            style:
              selectedTemplates.length === 1 && !acc.style
                ? root.data.style
                : acc.style,
          };
        },
        { blocks: {}, childrenIds: [], style: null }
      );

      const batchUpdate = () => {
        if (processedData.style && rootBlockOrder.length === 0) {
          setGlobalStyles(processedData.style);
        }

        setBlocks((prev) => ({ ...prev, ...processedData.blocks }));
        setRootBlockOrder((prev) => [...prev, ...processedData.childrenIds]);
      };

      requestAnimationFrame(batchUpdate);
      setUndoLocked(true);
    },
    [rootBlockOrder]
  );

  const updateGlobalStyles = (updatedStyles: any) => {
    setGlobalStyles(updatedStyles);
  };

  const updateBlock = (blockId: any, property: any, value: any) => {
    setBlocks((prevBlocks) => {
      const block = prevBlocks[blockId] as any;
      if (!block) return prevBlocks;

      let updatedBlocks = prevBlocks;

      if (block.type === BlockType.GRID && property === "columns") {
        const { columns: prevColumns, childBlocks = [] } = block;
        const newColumns = value;
        const columnDiff = newColumns - prevColumns;

        if (columnDiff > 0) {
          const newGridCellIds = Array.from({ length: columnDiff }, generateUniqueId);
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

          updatedBlocks = update(prevBlocks, {
            [blockId]: {
              columns: { $set: newColumns },
              childBlocks: { $push: newGridCellIds },
              cellWidths: { $set: getDistributtedLength(newColumns) },
            },
            ...newGridCells,
          });
          return updatedBlocks;
        }

        if (columnDiff < 0) {
          const updatedGridCells = childBlocks.slice(0, newColumns);
          const removedGridCells = childBlocks.slice(newColumns);
          const removeUpdates = Object.fromEntries(
            removedGridCells.map((id: any) => [id, { $unset: [id] }])
          );

          updatedBlocks = update(prevBlocks, {
            [blockId]: {
              columns: { $set: newColumns },
              childBlocks: { $set: updatedGridCells },
              cellWidths: { $set: getDistributtedLength(newColumns) },
            },
            ...removeUpdates,
          });
          return updatedBlocks;
        }
      }

      return update(prevBlocks, {
        [blockId]: { [property]: { $set: value } },
      });
    });
  };

  const onDeleteBlock = (blockId: string) => {
    const deleteBlock = blocks[blockId];
    if (!deleteBlock) return;

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
      setRootBlockOrder((prev) => prev.filter((id) => id !== blockId));
    }
  };

  const handleJsonUpload = (jsonData: any) => {
    try {
      const { blocks, rootBlock } = jsonToBlocks(jsonData);
      const { childrenIds, style } = rootBlock.data || {};
      setBlocks(blocks);
      setGlobalStyles(style);
      setRootBlockOrder(childrenIds || []);
      setUndoLocked(true);
      return { success: true, message: "Upload successful" };
    } catch (error) {
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
  };

  const handleInsertion = (dragSrc: any, dropAreaId: string) => {
    const blockID = generateUniqueId();
    const blockProps = { type: dragSrc.type as BlockType, id: blockID, parentId: undefined };
    const { defaultBlock, extraBlocks } = initializeBlock(blockProps as Block);

    setBlocks((prevBlocks) => {
      const dropBlock = dropAreaId ? prevBlocks[dropAreaId] : undefined;
      let newBlocks = { ...prevBlocks };

      if (dropBlock) {
        if (dropBlock.type === BlockType.GRIDCELL) {
          newBlocks = update(newBlocks, {
            [dropBlock.id]: { childBlocks: { $push: [blockID] } },
            [blockID]: { $set: { ...defaultBlock, parentId: dropBlock.id } },
          });
        } else if (dropBlock.parentId) {
          const parent = prevBlocks[dropBlock.parentId];
          if (parent?.type === BlockType.GRIDCELL) {
            const index = parent.childBlocks.findIndex((id) => id === dropBlock.id);
            newBlocks = update(newBlocks, {
              [parent.id]: { childBlocks: { $splice: [[index, 0, blockID]] } },
              [blockID]: { $set: { ...defaultBlock, parentId: parent.id } },
            });
          }
        } else {
          newBlocks[blockID] = defaultBlock;
          const index = rootBlockOrder.findIndex((id) => id === dropBlock.id);
          setRootBlockOrder((prev) => update(prev, { $splice: [[index, 0, blockID]] }));
        }
      } else {
        newBlocks[blockID] = defaultBlock;
        setRootBlockOrder((prev) => [...prev, blockID]);
      }

      return { ...newBlocks, ...extraBlocks };
    });

    setSelectedBlockId(defaultBlock.id);
  };

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
        data: { style: globalStyles, childrenIds: rootBlockOrder },
      },
    };

    rootBlockOrder?.forEach((blockId) => {
      const block = blocks[blockId];
      if (block) processBlock(block, blocks, layout, null);
    });

    return layout;
  };

  return {
    setSelectedBlock: setSelectedBlockId,
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
    undoLocked
  };
};
