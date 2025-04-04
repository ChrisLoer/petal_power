import { VStack, Text, Button, HStack } from "@chakra-ui/react";
import { useFelt } from "../utils/context";
import { useState, useEffect } from "react";
import { Layer, LayerSchema } from "@feltmaps/js-sdk";
import { useLayerStyle } from "../utils/useLayerStyle";

export function Color() {
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
      // Filter out null values
      const validLayers = fetchedLayers.filter((layer): layer is Layer => layer !== null);
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
      // Include numeric and text attributes for coloring
      const validAttributes = schema.attributes.filter(
        attr => attr.type === "numeric" || attr.type === "text"
      );
      setColumns(validAttributes);
      setSelectedColumn(""); // Reset column selection
    });
  }, [felt, selectedLayer, saveOriginalStyle]);

  const handleColor = async () => {
    if (!selectedLayer || !selectedColumn) return;
    setIsLoading(true);
    
    try {
      // Get the current layer to access its style
      const layer = await felt.getLayer(selectedLayer);
      if (!layer) throw new Error("Layer not found");

      const currentStyle = layer.style as { paint: any };
      const currentPaint = Array.isArray(currentStyle.paint) ? currentStyle.paint[0] : currentStyle.paint;

      // Add color properties to the paint's layoutPropertyOverrides
      const updatedPaint = {
        ...currentPaint,
        paintPropertyOverrides: {
          ...currentPaint.paintPropertyOverrides,
          "icon-color": ["get", selectedColumn],
          "fill-color": ["get", selectedColumn],
          "circle-color": ["get", selectedColumn],
          "line-color": ["get", selectedColumn],
          "text-color": ["get", selectedColumn]
        }
      };

      // Update the style with the color properties
      await felt.setLayerStyle({
        id: selectedLayer,
        style: {
          ...currentStyle,
          paint: Array.isArray(currentStyle.paint) 
            ? [updatedPaint, ...currentStyle.paint.slice(1)]
            : updatedPaint
        }
      });

      console.log("Added color properties to layer:", selectedLayer, "using column:", selectedColumn);
    } catch (error) {
      console.error("Error coloring layer:", error);
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
        Color
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
        <option value="">Select layer</option>
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
            {column.id} ({column.type})
          </option>
        ))}
      </select>

      <HStack width="100%" gap={4}>
        <Button 
          colorScheme="blue" 
          flex="1"
          onClick={handleColor}
          disabled={!selectedLayer || !selectedColumn || isLoading || isResetting}
          loading={isLoading}
        >
          Color by this value
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
