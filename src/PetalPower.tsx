import { Box, Text, VStack, HStack } from "@chakra-ui/react";
import { useFelt } from "./utils/context";
import { useState, useCallback, useEffect } from "react";
import { FeatureCollection, Feature } from "geojson";

const PETAL_COLORS = [
  "rgb(219, 60, 147)",
  "rgb(250, 158, 50)",
  "rgb(254, 206, 6)",
  "rgb(156, 190, 77)",
  "rgb(6, 165, 170)",
  "rgb(133, 115, 167)"
];

type ColumnInfo = {
  name: string;
  min: number | null;
  max: number | null;
};

type Interval = {
  min: number;
  max: number;
  color: string;
};

export function PetalPower() {
  const felt = useFelt();
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [selectedDateColumn, setSelectedDateColumn] = useState<string>("");
  const [selectedCountColumn, setSelectedCountColumn] = useState<string>("");
  const [geojsonData, setGeojsonData] = useState<FeatureCollection | null>(null);
  const [intervals, setIntervals] = useState<Interval[]>([]);

  const calculateIntervals = useCallback((min: number, max: number) => {
    const range = max - min;
    const intervalSize = range / 6;
    return PETAL_COLORS.map((color, index) => ({
      min: min + intervalSize * index,
      max: min + intervalSize * (index + 1),
      color
    }));
  }, []);

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

  // Update intervals when date column changes
  useEffect(() => {
    if (selectedDateColumn) {
      const dateColumn = columns.find(col => col.name === selectedDateColumn);
      if (dateColumn && dateColumn.min !== null && dateColumn.max !== null) {
        setIntervals(calculateIntervals(dateColumn.min, dateColumn.max));
      }
    } else {
      setIntervals([]);
    }
  }, [selectedDateColumn, columns, calculateIntervals]);

  // Add layer to map when both columns are selected
  const addLayerToMap = useCallback(() => {
    if (!geojsonData || !selectedDateColumn || !selectedCountColumn) return;

    const dateColumn = columns.find(col => col.name === selectedDateColumn);
    if (!dateColumn || dateColumn.min === null || dateColumn.max === null) return;

    const countColumn = columns.find(col => col.name === selectedCountColumn);
    if (!countColumn || countColumn.max === null) return;

    const maxCount = countColumn.max;
    const range = dateColumn.max - dateColumn.min;
    const intervalCount = PETAL_COLORS.length;
    const intervalSize = range / intervalCount;

    // Since we know dateColumn.min is not null at this point, we can safely use it
    const min = dateColumn.min;
    const max = dateColumn.max;
    const intervals = Array.from({ length: intervalCount }, (_, i) => ({
      min: min + intervalSize * i,
      max: min + intervalSize * (i + 1),
      color: PETAL_COLORS[i],
      rotation: (360 / intervalCount) * i
    }));

    const style = {
      config: {
        labelAttribute: [selectedDateColumn],
        numericAttribute: selectedDateColumn,
        steps: intervals.map(interval => interval.min).concat(max)
      },
      legend: { displayName: "auto" },
      paint: {
        color: PETAL_COLORS,
        iconFrame: "none",
        iconImage: "water",
        maplibreLayoutProperties: {
          "icon-offset": [0, 5],
          "icon-rotate": [
            "step",
            ["get", selectedDateColumn],
            0,
            ...intervals.flatMap(interval => [interval.min, interval.rotation])
          ],
          "icon-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            3,
            ["*", 
              ["/",
                ["sqrt", ["get", selectedCountColumn]],
                ["sqrt", maxCount]
              ],
              10
            ],
            6,
            ["*", 
              ["/",
                ["sqrt", ["get", selectedCountColumn]],
                ["sqrt", maxCount]
              ],
              40
            ],
            9,
            ["*", 
              ["/",
                ["sqrt", ["get", selectedCountColumn]],
                ["sqrt", maxCount]
              ],
              60
            ],
            12,
            ["*", 
              ["/",
                ["sqrt", ["get", selectedCountColumn]],
                ["sqrt", maxCount]
              ],
              80
            ],
            15,
            ["/",
              ["sqrt", ["get", selectedCountColumn]],
              ["sqrt", maxCount]
            ]
          ]
        },
        opacity: 0.6,
        size: 4,
        strokeColor: "auto",
        strokeWidth: 0
      },
      type: "numeric",
      version: "2.3.1"
    };

    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(JSON.stringify(geojsonData));
    const arrayBuffer = uint8Array.buffer;

    felt.createLayer({
      source: {
        type: "application/geo+json",
        name: "Petal Power Data",
        arrayBuffer,
        geometryStyles: {
          Point: style
        },
      },
    })
    .then((result) => {
      console.log("Layer created successfully:", result);
    })
    .catch((error) => {
      console.error("Error creating layer:", error);
      alert(error.message || "There was an error creating the visualization");
    });
  }, [felt, geojsonData, selectedDateColumn, selectedCountColumn, columns]);

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

          {intervals.length > 0 && (
            <VStack width="100%" gap={2} p={2} bg="gray.50" borderRadius="md">
              <Text fontSize="sm" fontWeight="medium">Date Ranges:</Text>
              {intervals.map((interval, index) => (
                <HStack key={index} width="100%" gap={3}>
                  <Box width="20px" height="20px" bg={interval.color} borderRadius="sm" />
                  <Text fontSize="sm">
                    {interval.min.toFixed(2)} - {interval.max.toFixed(2)}
                  </Text>
                </HStack>
              ))}
            </VStack>
          )}

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
