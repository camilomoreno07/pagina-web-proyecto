'use client';
import React, { useState } from 'react';

interface ResumenProps {
  description: string;
}

const Resumen = ({ description }: ResumenProps) => {
  const [showFull, setShowFull] = useState(false);

  return (
    <div className="w-full">

      <p className={showFull ? 'text-gray-600' : 'text-gray-600 line-clamp-2'}>
        {description}
      </p>

      {description.length > 200 && (
        <button
          onClick={() => setShowFull(!showFull)}
          className="mt-2 text-sm text-primary-600 hover:underline"
        >
          {showFull ? 'Ver menos' : 'Ver más'}
        </button>
      )}
    </div>
  );
};

export default Resumen;
