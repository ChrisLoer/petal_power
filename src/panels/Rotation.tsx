import { VStack, Text, Button, HStack } from "@chakra-ui/react";
import { useFelt } from "../utils/context";
import { useState, useEffect } from "react";
import { Layer, LayerSchema } from "@feltmaps/js-sdk";
import { useLayerStyle } from "../utils/useLayerStyle";

export function Rotation() {
  const felt = useFelt();
  const [selectedLayer, setSelectedLayer] = useState("");
  const [selectedColumn, setSelectedColumn] = useState("");
  const [layers, setLayers] = useState<Layer[]>([]);
  const [columns, setColumns] = useState<LayerSchema["attributes"]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { originalStyle, isResetting, saveOriginalStyle, resetStyle } = useLayerStyle();

  useEffect(() => {
    // Fetch layers when component mounts
    felt.getLayers().then((fetchedLayers) => {
      // Filter out null values and only keep Point layers with iconImage
      const validLayers = fetchedLayers.filter((layer): layer is Layer => {
        if (!layer || layer.geometryType !== "Point") return false;
        
        const style = layer.style as { paint: any };
        const paint = Array.isArray(style.paint) ? style.paint[0] : style.paint;
        return paint && paint.iconImage;
      });
      setLayers(validLayers);
    });
  }, [felt]);

  // When layer selection changes, fetch its schema and save original style
  useEffect(() => {
    if (!selectedLayer) {
      setColumns([]);
      setSelectedColumn("");
      return;
    }

    saveOriginalStyle(selectedLayer);

    felt.getLayerSchema(selectedLayer).then((schema) => {
      // Only include numeric attributes for rotation
      const numericAttributes = schema.attributes.filter(
        attr => attr.type === "numeric"
      );
      setColumns(numericAttributes);
      setSelectedColumn(""); // Reset column selection
    });
  }, [felt, selectedLayer, saveOriginalStyle]);

  const handleRotate = async () => {
    if (!selectedLayer || !selectedColumn) return;
    setIsLoading(true);
    
    try {
      // Get the current layer to access its style
      const layer = await felt.getLayer(selectedLayer);
      if (!layer) throw new Error("Layer not found");

      const currentStyle = layer.style as { paint: any };
      const currentPaint = Array.isArray(currentStyle.paint) ? currentStyle.paint[0] : currentStyle.paint;

      // Add rotation to the paint's maplibreLayoutProperties
      const updatedPaint = {
        ...currentPaint,
        maplibreLayoutProperties: {
          ...currentPaint.maplibreLayoutProperties,
          "icon-rotate": ["to-number", ["get", selectedColumn]]
        }
      };

      // Update the style with the rotation
      await felt.setLayerStyle({
        id: selectedLayer,
        style: {
          ...currentStyle,
          paint: Array.isArray(currentStyle.paint) 
            ? [updatedPaint, ...currentStyle.paint.slice(1)]
            : updatedPaint
        }
      });

      console.log("Added rotation to layer:", selectedLayer, "using column:", selectedColumn);
    } catch (error) {
      console.error("Error rotating layer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (selectedLayer) {
      resetStyle(selectedLayer);
    }
  };

  return (
    <VStack
      bg="white"
      width="400px"
      p={4}
      alignItems="start"
      gap={4}
      borderRadius="md"
      boxShadow="md"
    >
      <Text fontSize="xl" fontWeight="bold">
        Rotation
      </Text>

      <select
        value={selectedLayer}
        onChange={(e) => setSelectedLayer(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          borderRadius: "6px",
          border: "1px solid #E2E8F0"
        }}
      >
        <option value="">Select point layer with icon</option>
        {layers.map(layer => (
          <option key={layer.id} value={layer.id}>
            {layer.name}
          </option>
        ))}
      </select>

      <select
        value={selectedColumn}
        onChange={(e) => setSelectedColumn(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          borderRadius: "6px",
          border: "1px solid #E2E8F0"
        }}
        disabled={!selectedLayer}
      >
        <option value="">Select column</option>
        {columns.map(column => (
          <option key={column.id} value={column.id}>
            {column.id}
          </option>
        ))}
      </select>

      <HStack width="100%" gap={4}>
        <Button 
          colorScheme="blue" 
          flex="1"
          onClick={handleRotate}
          disabled={!selectedLayer || !selectedColumn || isLoading || isResetting}
          loading={isLoading}
        >
          Rotate by this value
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={!selectedLayer || !originalStyle || isLoading || isResetting}
          loading={isResetting}
        >
          Reset
        </Button>
      </HStack>
    </VStack>
  );
} 
