'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { CollectionBoard } from '../../../../components/boards/collection-board';

export default function BoardPage() {
  const params = useParams();
  const boardId = params?.id as string;

  return <CollectionBoard boardId={boardId} />;
}
