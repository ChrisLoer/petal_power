import { Box, Center, Spinner, Text, VStack } from "@chakra-ui/react";

export function Map({
  mapRef,
  loading,
}: {
  mapRef: React.Ref<HTMLDivElement>;
  loading: boolean;
}) {
  return (
    <Box
      ref={mapRef}
      bg="gray.100"
      height="100%"
      css={{
        "& > iframe": {
          position: "relative",
          zIndex: 1,
        },
      }}
    >
      {loading && (
        <Center zIndex={0} position="absolute" inset={0}>
          <VStack gap={3}>
            <Spinner />
            <Text fontSize="sm">Loading map&hellip;</Text>
          </VStack>
        </Center>
      )}
    </Box>
  );
}
