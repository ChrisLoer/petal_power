import { Box, Text, VStack } from "@chakra-ui/react";
import { useFelt } from "./utils/context";
import { useState, useCallback, useEffect } from "react";
import { FeatureCollection, Feature } from "geojson";

type ColumnInfo = {
  name: string;
  min: number | null;
  max: number | null;
};

export function PetalPower() {
  const felt = useFelt();
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [selectedDateColumn, setSelectedDateColumn] = useState<string>("");
  const [selectedCountColumn, setSelectedCountColumn] = useState<string>("");
  const [geojsonData, setGeojsonData] = useState<FeatureCollection | null>(null);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    const text = await file.text();
    const json = JSON.parse(text) as FeatureCollection;
    setGeojsonData(json);

    // Collect unique column names and their min/max values
    const columnMap = new Map<string, ColumnInfo>();
    
    json.features.forEach((feature: Feature) => {
      if (!feature.properties) return;
      
      Object.entries(feature.properties).forEach(([key, value]) => {
        if (!columnMap.has(key)) {
          columnMap.set(key, { name: key, min: null, max: null });
        }
        
        const numValue = Number(value);
        if (!isNaN(numValue)) {
          const info = columnMap.get(key)!;
          info.min = info.min === null ? numValue : Math.min(info.min, numValue);
          info.max = info.max === null ? numValue : Math.max(info.max, numValue);
        }
      });
    });

    setColumns(Array.from(columnMap.values()));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  // Add layer to map when both columns are selected
  const addLayerToMap = useCallback(() => {
    if (!geojsonData || !selectedDateColumn || !selectedCountColumn) return;

    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(JSON.stringify(geojsonData));
    const arrayBuffer = uint8Array.buffer;

    felt.createLayer({
      source: {
        type: "application/geo+json",
        name: "Petal Power Data",
        arrayBuffer,
      },
    });
  }, [felt, geojsonData, selectedDateColumn, selectedCountColumn]);

  // When both columns are selected, add the layer
  useEffect(() => {
    if (selectedDateColumn && selectedCountColumn) {
      addLayerToMap();
    }
  }, [selectedDateColumn, selectedCountColumn, addLayerToMap]);

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
        Petal Power
      </Text>

      {columns.length === 0 ? (
        <Box
          border="2px dashed"
          borderColor="gray.300"
          borderRadius="md"
          p={8}
          width="100%"
          textAlign="center"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Text>Please drag in a GeoJSON file with point data</Text>
        </Box>
      ) : (
        <VStack width="100%" gap={4}>
          <Box width="100%">
            <select
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #E2E8F0"
              }}
              value={selectedDateColumn}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedDateColumn(e.target.value)}
            >
              <option value="">Select date column</option>
              {columns.map((col) => (
                <option key={col.name} value={col.name}>
                  {col.name}
                </option>
              ))}
            </select>
          </Box>

          <Box width="100%">
            <select
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #E2E8F0"
              }}
              value={selectedCountColumn}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCountColumn(e.target.value)}
            >
              <option value="">Select count column</option>
              {columns.map((col) => (
                <option key={col.name} value={col.name}>
                  {col.name}
                </option>
              ))}
            </select>
          </Box>
        </VStack>
      )}
    </VStack>
  );
} 
