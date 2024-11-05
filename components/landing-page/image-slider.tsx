import React, { useState } from "react";
import { Button } from "@/components/ui/button";

const ImageComparison = ({
  beforeImage = "/api/placeholder/840/560",
  afterImage = "/api/placeholder/840/560",
  beforeLabel = "Before",
  afterLabel = "After",
  alt = "Comparison image",
}) => {
  const [showAfter, setShowAfter] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-2 px-0">
      <h3 className="text-xl md:text-2xl font-bold text-center">{alt}</h3>

      <div className="relative aspect-video rounded-lg overflow-hidden group border-2 md:border-4 border-gray-200 hover:border-primary transition-colors duration-200">
        {/* Images with mobile zoom */}
        <img
          src={beforeImage}
          alt={`${alt} - ${beforeLabel}`}
          className={`w-full h-full object-cover scale-105 md:scale-100 transition-opacity duration-200 ${
            showAfter ? "opacity-0" : "opacity-100"
          }`}
        />
        <img
          src={afterImage}
          alt={`${alt} - ${afterLabel}`}
          className={`absolute inset-0 w-full h-full object-cover scale-105 md:scale-100 transition-opacity duration-200 ${
            showAfter ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Buttons - Repositioned and restyled */}
        <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-1 md:gap-2">
          <Button
            variant={!showAfter ? "default" : "secondary"}
            onClick={() => setShowAfter(false)}
            className="min-w-16 md:min-w-24 shadow-lg text-xs md:text-sm py-1 px-2 md:px-4 h-auto"
            size="sm"
          >
            {beforeLabel}
          </Button>
          <Button
            variant={showAfter ? "default" : "secondary"}
            onClick={() => setShowAfter(true)}
            className="min-w-16 md:min-w-24 shadow-lg text-xs md:text-sm py-1 px-2 md:px-4 h-auto"
            size="sm"
          >
            {afterLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageComparison;