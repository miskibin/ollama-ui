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
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <h3 className="text-2xl font-bold text-center">{alt}</h3>

      <div className="relative aspect-video rounded-lg overflow-hidden group border-2 border-dashed border-gray-200 hover:border-primary transition-colors duration-300">
        {/* Images */}
        <img
          src={beforeImage}
          alt={`${alt} - ${beforeLabel}`}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            showAfter ? "opacity-0" : "opacity-100"
          }`}
        />
        <img
          src={afterImage}
          alt={`${alt} - ${afterLabel}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            showAfter ? "opacity-100" : "opacity-0"
          }`}
        />

     
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          <Button
            variant={!showAfter ? "default" : "secondary"}
            onClick={() => setShowAfter(false)}
            className="min-w-24 shadow-lg"
            size="sm"
          >
            {beforeLabel}
          </Button>
          <Button
            variant={showAfter ? "default" : "secondary"}
            onClick={() => setShowAfter(true)}
            className="min-w-24 shadow-lg"
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
