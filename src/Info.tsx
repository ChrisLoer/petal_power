import { ButtonGroup, Button, Text, VStack, Icon } from "@chakra-ui/react";
import {
  MdDirectionsBike,
  MdDirectionsWalk,
  MdDirectionsCar,
} from "react-icons/md";
import { TransportMode, useIsochrones } from "./useIsochrones";
import { IconType } from "react-icons";

const transportModes = [
  { mode: "walk" as TransportMode, icon: MdDirectionsWalk, label: "Walk" },
  { mode: "bicycle" as TransportMode, icon: MdDirectionsBike, label: "Bike" },
  { mode: "drive" as TransportMode, icon: MdDirectionsCar, label: "Car" },
];

export function Info() {
  const { loading, currentMode, setMode } = useIsochrones();

  return (
    <VStack bg="bg" width="400px" p={4} alignItems="start" gap={8}>
      <Text>
        Select a mode of transport and add a pin on the mapto see 10, 20 and 30
        minute isochrones. Deleting the pin will delete the isochrones.
      </Text>

      <ButtonGroup size="md" variant="outline" width="100%">
        {transportModes.map(({ mode, icon, label }) => (
          <TransportModeButton
            key={mode}
            mode={mode}
            selectedMode={currentMode}
            loading={loading}
            icon={icon}
            label={label}
            onToggle={setMode}
          />
        ))}
      </ButtonGroup>
    </VStack>
  );
}

function TransportModeButton(props: {
  mode: TransportMode;
  selectedMode: TransportMode | null;
  loading: boolean;
  disabled?: boolean;
  icon: IconType;
  label: string;
  onToggle: (mode: TransportMode | null) => void;
}) {
  const { mode, selectedMode, loading, disabled, icon, label, onToggle } =
    props;
  const isSelected = selectedMode === mode;

  return (
    <Button
      onClick={() => {
        if (selectedMode === mode) onToggle(null);
        else onToggle(mode);
      }}
      flex="1"
      colorScheme={isSelected ? "blue" : "gray"}
      variant={isSelected ? "solid" : "outline"}
      loading={isSelected && loading}
      disabled={!isSelected && loading}
    >
      <Icon as={icon} mr={2} />
      {label}
    </Button>
  );
}
