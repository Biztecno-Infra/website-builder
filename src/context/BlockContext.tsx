import { createContext, useContext, ReactNode, useImperativeHandle, forwardRef } from "react";
import { useBlocks } from "../hoc/useBlocks"; 
import { BlockHookRef, IBlockContext } from "../types";


const BlockHookContext = createContext<any>(null);

interface BlockHookProviderProps {
  children: ReactNode;
}

export const BlockHookProvider = forwardRef<BlockHookRef, BlockHookProviderProps>(({ children }: BlockHookProviderProps, ref) => {
  const customFunction = useBlocks();

  useImperativeHandle(ref, () => ({
    getHTML: customFunction.convertJsonToHtml,
    updateJSON: customFunction.handleJsonUpload,
    getJSON: customFunction.blocksToJson,
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