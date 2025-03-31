import { Felt, FeltController, FeltEmbedOptions } from "@feltmaps/js-sdk";
import React from "react";

export function useFeltEmbed(mapId: string, embedOptions: FeltEmbedOptions) {
  const [felt, setFelt] = React.useState<FeltController | null>(null);
  const hasLoadedRef = React.useRef(false);
  const mapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    async function loadFelt() {
      if (hasLoadedRef.current) return;
      if (!mapRef.current) return;

      hasLoadedRef.current = true;
      const felt = await Felt.embed(mapRef.current, mapId, embedOptions);
      setFelt(felt);
    }

    loadFelt();
  }, []);

  return {
    felt,
    mapRef,
  };
}
