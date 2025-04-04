import { MAP_ID } from "./utils/consts";
import { FeltContext } from "./utils/context";
import { useFeltEmbed } from "./utils/useFeltEmbed";
import { Map } from "./Map";
import { Box, Theme, VStack } from "@chakra-ui/react";
import { PetalPower } from "./PetalPower";
import { DropShadow } from "./panels/DropShadow";
import { Rotation } from "./panels/Rotation";
import { Color } from "./panels/Color";

export default function App() {
  const { felt, mapRef } = useFeltEmbed(MAP_ID, {
    uiControls: {
      cooperativeGestures: false,
      fullScreenButton: false,
      showLegend: false,
    }
  });

  return (
    <Theme>
      <Box position="relative">
        <Box width="100vw" height="100vh" position="absolute">
          <Map mapRef={mapRef} loading={!felt} />
        </Box>

        {felt && (
          <FeltContext.Provider value={felt}>
            <Box zIndex={1} position="fixed" p="4">
              <VStack gap={4} align="stretch">
                <PetalPower />
                <DropShadow />
                <Rotation />
                <Color />
              </VStack>
            </Box>
          </FeltContext.Provider>
        )}
      </Box>
    </Theme>
  );
}
