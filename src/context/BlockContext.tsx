import { createContext, useContext, ReactNode, useImperativeHandle, forwardRef } from "react";
import { useBlocks } from "../hoc/useBlocks";
import { BlockHookRef, IBlockContext } from "../types";
import { convertJsonToHtml } from "email-builder-utils";


const BlockHookContext = createContext<any>(null);

interface BlockHookProviderProps {
  children: ReactNode;
}

export const BlockHookProvider = forwardRef<BlockHookRef, BlockHookProviderProps>(({ children }: BlockHookProviderProps, ref) => {
  const customFunction = useBlocks();
  const { handleJsonUpload, blocksToJson, blocks, rootBlockOrder } = customFunction;

  useImperativeHandle(ref, () => ({
    getHTML: async (jsonData) => await convertJsonToHtml(jsonData),
    updateJSON: (newJson,) => handleJsonUpload(newJson),
    getJSON: () => blocksToJson(blocks, rootBlockOrder),
  }));

  return <BlockHookContext.Provider value={customFunction}>{children}</BlockHookContext.Provider>;
});

export const useBlockHook = (): IBlockContext => {
  const context = useContext(BlockHookContext);
  if (!context) {
    throw new Error("useCustomFunction must be used within a BlockHookProvider");
  }
  return context;
};