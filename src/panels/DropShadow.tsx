import { VStack, Text, Button } from "@chakra-ui/react";
import { useFelt } from "../utils/context";
import { useState, useEffect } from "react";
import { Layer } from "@feltmaps/js-sdk";

export function DropShadow() {
  const felt = useFelt();
  const [selectedLayer, setSelectedLayer] = useState("");
  const [layers, setLayers] = useState<Layer[]>([]);

  useEffect(() => {
    // Fetch layers when component mounts
    felt.getLayers().then((fetchedLayers) => {
      // Filter out null values and cast to Layer[]
      const validLayers = fetchedLayers.filter((layer): layer is Layer => layer !== null);
      setLayers(validLayers);
    });
  }, [felt]);

  const handleAddShadow = () => {
    if (!selectedLayer) return;
    console.log("Adding shadow to layer:", selectedLayer);
    // Shadow logic will be implemented later
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
        <option value="">Select layer</option>
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
        disabled={!selectedLayer}
      >
        Add Drop Shadow
      </Button>
    </VStack>
  );
} 
