import { VStack, Text, Button } from "@chakra-ui/react";
import { useFelt } from "../utils/context";
import { useState, useEffect } from "react";
import { Layer } from "@feltmaps/js-sdk";

export function DropShadow() {
  const felt = useFelt();
  const [selectedLayer, setSelectedLayer] = useState("");
  const [layers, setLayers] = useState<Layer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch layers when component mounts
    felt.getLayers().then((fetchedLayers) => {
      // Filter out null values and only keep Polygon layers
      const validLayers = fetchedLayers.filter((layer): layer is Layer => 
        layer !== null && layer.geometryType === "Polygon"
      );
      setLayers(validLayers);
    });
  }, [felt]);

  const handleAddShadow = async () => {
    if (!selectedLayer) return;
    setIsLoading(true);

    try {
      // Get the current layer to access its style
      const layer = await felt.getLayer(selectedLayer);
      if (!layer) throw new Error("Layer not found");

      const currentStyle = layer.style as { paint: any };
      const currentPaint = Array.isArray(currentStyle.paint) 
        ? currentStyle.paint 
        : [currentStyle.paint];

      // Create the shadow style
      const shadowStyle = {
        color: "black",
        maplibrePaintProperties: {
          "fill-translate": [3, 3]
        }
      };

      // Update the style with the shadow
      await felt.setLayerStyle({
        id: selectedLayer,
        style: {
          ...currentStyle,
          paint: [...currentPaint, shadowStyle]
        }
      });

      console.log("Added drop shadow to layer:", selectedLayer);
    } catch (error) {
      console.error("Error adding drop shadow:", error);
    } finally {
      setIsLoading(false);
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
        Drop Shadow
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
        <option value="">Select polygon layer</option>
        {layers.map(layer => (
          <option key={layer.id} value={layer.id}>
            {layer.name}
          </option>
        ))}
      </select>

      <Button 
        colorScheme="blue" 
        width="100%" 
        onClick={handleAddShadow}
        disabled={!selectedLayer || isLoading}
        loading={isLoading}
      >
        Add Drop Shadow
      </Button>
    </VStack>
  );
} 
