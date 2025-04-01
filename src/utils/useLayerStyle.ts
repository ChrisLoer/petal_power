import { useState, useCallback } from 'react';
import { useFelt } from './context';

export function useLayerStyle() {
  const felt = useFelt();
  const [originalStyle, setOriginalStyle] = useState<object | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const saveOriginalStyle = useCallback(async (layerId: string) => {
    const layer = await felt.getLayer(layerId);
    if (layer) {
      setOriginalStyle(layer.style);
    }
  }, [felt]);

  const resetStyle = useCallback(async (layerId: string) => {
    if (!originalStyle || !layerId) return;
    
    setIsResetting(true);
    try {
      await felt.setLayerStyle({
        id: layerId,
        style: originalStyle
      });
      console.log("Reset style for layer:", layerId);
    } catch (error) {
      console.error("Error resetting style:", error);
    } finally {
      setIsResetting(false);
    }
  }, [felt, originalStyle]);

  return {
    originalStyle,
    isResetting,
    saveOriginalStyle,
    resetStyle
  };
} 
