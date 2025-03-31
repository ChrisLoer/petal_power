import React, { useState, useEffect } from "react";
import { useFelt } from "./utils/context";
import { useQueries } from "@tanstack/react-query";

export type TransportMode = "drive" | "bicycle" | "walk";

const config = [
  { time: 30 * 60, color: "#E8B500" },
  { time: 20 * 60, color: "#E76D02" },
  { time: 10 * 60, color: "#C93535" },
];

export function useIsochrones() {
  const felt = useFelt();
  const [mode, setMode] = useState<TransportMode | null>(null);
  const [location, setLocation] = React.useState<{
    id: string;
    lng: number;
    lat: number;
  } | null>(null);

  const isochroneQueries = useQueries({
    queries: config.map(({ time, color }) => {
      return {
        queryKey: [mode, location, time],
        queryFn: () => {
          if (!(location && mode)) return null;
          return getIsochrone({
            lng: location.lng,
            lat: location.lat,
            mode,
            time,
          });
        },
        enabled: !!(location && mode),
      };
    }),
    combine: (results) => {
      const combinedFeatureCollection = {
        type: "FeatureCollection",
        properties: { locationId: location?.id },
        features: results
          .filter((result) => Boolean(result.data))
          .flatMap((result) => result.data.features || []),
      };

      return {
        pending: results.some((result) => result.isPending),
        isSuccess: results.every((result) => result.isSuccess),
        loading: results.some((result) => result.isLoading),
        data: combinedFeatureCollection,
      };
    },
  });

  useEffect(() => {
    felt.setToolSettings({
      tool: "pin",
      afterCreation: "select",
    });
    const unsubsribe = felt.onElementCreate({
      handler: async ({ element }) => {
        if (element?.type === "Place") {
          const pinId = element.id;
          const geo = await felt.getElementGeometry(pinId);
          if (!geo || geo.type !== "Point") return;
          const [lng, lat] = geo.coordinates;
          setLocation({ id: pinId, lng, lat });
        }
      },
    });
    return unsubsribe;
  }, [felt]);

  useEffect(() => {
    if (mode) {
      felt.setTool("pin");
    } else {
      felt.setTool(null);
    }
  }, [mode]);

  if (isochroneQueries.isSuccess) {
    const locationId = isochroneQueries.data.properties.locationId;
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(JSON.stringify(isochroneQueries.data));
    const arrayBuffer = uint8Array.buffer;

    const style = {
      type: "categorical",
      version: "2.3.1",
      config: {
        categoricalAttribute: "range",
        categories: config.map((x) => x.time),
      },
      legend: {},
      paint: {
        color: config.map((x) => x.color),
        opacity: 0.4,
      },
    };

    felt
      .createLayer({
        source: {
          type: "application/geo+json",
          name: "Isochrones",
          arrayBuffer,
          geometryStyles: {
            Polygon: style,
          },
        },
      })
      .then((layerGroup) => {
        if (!locationId) return;
        const layerId = layerGroup?.layerIds.at(0);
        if (!layerId) return;

        felt.onElementDelete({
          options: { id: locationId },
          handler: () => {
            felt.deleteLayer(layerId);
          },
        });
      });
    setLocation(null);
    setMode(null);
  }

  return {
    loading: isochroneQueries.loading,
    currentMode: mode,
    setMode,
  };
}

function getIsochrone({
  lng,
  lat,
  mode,
  time,
}: {
  lng: number;
  lat: number;
  mode: string;
  time: number;
}) {
  console.log(
    `Getting isochrone for ${lng}, ${lat} with mode ${mode} and time ${
      time / 60
    }`
  );
  return fetch(
    `https://api.geoapify.com/v1/isoline?lat=${lat}&lon=${lng}&type=time&mode=${mode}&range=${time}&apiKey=88ca5fc7edfa494fbdce9875931e26f5`,
    {
      method: "GET",
    }
  ).then((res) => res.json());
}
