import { createContext, useContext, ReactNode, useImperativeHandle, forwardRef, useRef } from "react";
import { useBlocks } from "../hoc/useBlocks";
import { BlockHookRef, IBlockContext } from "../types";
import { convertJsonToHtml } from "email-builder-utils";
import html2canvas from "html2canvas";


const BlockHookContext = createContext<any>(null);

interface BlockHookProviderProps {
  children: ReactNode;
}

export const BlockHookProvider = forwardRef<BlockHookRef, BlockHookProviderProps>(({ children }: BlockHookProviderProps, ref) => {
  const customFunction = useBlocks();

  const { handleJsonUpload, blocksToJson, blocks, rootBlockOrder , canvasRef , handleImportTemplates , setSelectedBlock , undo , redo , undoLocked , setUndoLocked , handleBrandingSelect , selectedBrand } = customFunction;

  const captureScreenshot = async (): Promise<File | null> => {
    setSelectedBlock(null); 
    
    await new Promise(resolve => setTimeout(resolve, 50)); 
    
    if (!canvasRef.current) return null;
  
    try {
      const canvas = await html2canvas(canvasRef.current, { useCORS: true, allowTaint: true });
      // const imageBase64 = canvas.toDataURL("image/png");
      // console.log(imageBase64);
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/png");
      });
  
      if (!blob) return null;
  
      return new File([blob], "screenshot.png", { type: "image/png" });
    } catch (error) {
      console.error("❌ Error capturing screenshot:", error);
      return null;
    }
  };
  


  useImperativeHandle(ref, () => ({
    getHTML: async (jsonData) => await convertJsonToHtml(jsonData),
    updateJSON: (newJson) => handleJsonUpload(newJson),
    getJSON: () => blocksToJson(blocks, rootBlockOrder),
    getScreenShot : () => captureScreenshot(), 
    importTemplate: (templates: any[]) => handleImportTemplates(templates),
    redo,
    undo,
    undoLocked, 
    setUndoLocked, 
    onBrandingSelect: handleBrandingSelect,
    selectedBrand
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