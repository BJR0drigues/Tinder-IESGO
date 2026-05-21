'use client';

// Componente Card legado — substituído pelo ProfileCard inline no app/(app)/feed/page.tsx
// Mantido para evitar erros de import em outros lugares

import React from 'react';

interface CardProps {
  user?: unknown;
  onSwipe?: (dir: string) => void;
  index?: number;
  [key: string]: unknown;
}

const Card: React.FC<CardProps> = () => null;
export default Card;
