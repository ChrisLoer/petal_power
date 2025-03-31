import { MAP_ID } from "./utils/consts";
import { FeltContext } from "./utils/context";
import { useFeltEmbed } from "./utils/useFeltEmbed";
import { Map } from "./Map";
import { Box, Theme } from "@chakra-ui/react";
import { PetalPower } from "./PetalPower";

export default function App() {
  const { felt, mapRef } = useFeltEmbed(MAP_ID, {
    uiControls: {
      cooperativeGestures: false,
      fullScreenButton: false,
      showLegend: false,
    },
    origin: "https://felt-pr-14477.onrender.com/"
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
              <PetalPower />
            </Box>
          </FeltContext.Provider>
        )}
      </Box>
    </Theme>
  );
}
