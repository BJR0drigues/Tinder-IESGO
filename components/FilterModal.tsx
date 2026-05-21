'use client';

// FilterModal legado — filtros agora são inline nas páginas do App Router
import React from 'react';

interface FilterModalProps {
  isOpen?:  boolean;
  onClose?: () => void;
  [key: string]: unknown;
}

const FilterModal: React.FC<FilterModalProps> = () => null;
export default FilterModal;
