import { VStack, Text, Button } from "@chakra-ui/react";
import { useFelt } from "../utils/context";
import { useState, useEffect } from "react";
import { Layer } from "@feltmaps/js-sdk";

export function Color() {
  const felt = useFelt();
  const [selectedLayer, setSelectedLayer] = useState("");
  const [selectedColumn, setSelectedColumn] = useState("");
  const [layers, setLayers] = useState<Layer[]>([]);

  useEffect(() => {
    // Fetch layers when component mounts
    felt.getLayers().then((fetchedLayers) => {
      // Filter out null values and cast to Layer[]
      const validLayers = fetchedLayers.filter((layer): layer is Layer => layer !== null);
      setLayers(validLayers);
    });
  }, [felt]);

  // Placeholder columns for now
  const columns = [
    { id: "col1", name: "Category" },
    { id: "col2", name: "Value" },
    { id: "col3", name: "Type" }
  ];

  const handleColor = () => {
    if (!selectedLayer || !selectedColumn) return;
    console.log("Coloring layer:", selectedLayer, "by column:", selectedColumn);
    // Color logic will be implemented later
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
      >
        <option value="">Select column</option>
        {columns.map(column => (
          <option key={column.id} value={column.id}>
            {column.name}
          </option>
        ))}
      </select>

      <Button 
        colorScheme="blue" 
        width="100%" 
        onClick={handleColor}
        disabled={!selectedLayer || !selectedColumn}
      >
        Color by this value
      </Button>
    </VStack>
  );
} 
