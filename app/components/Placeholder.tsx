"use client"
/**
 * Placeholder
 * ---------------------------------------------------------------------------
 * Temporary placeholder while Placeholder element integration is pending. Mirrors
 * layout behavior of the card container (kept mounted, hidden via CSS).
 */
import React from 'react'

export const Placeholder: React.FC = () => {
  return (
    <div
      id="placeholder"
      className="rounded-l border border-dashed border-gray-600 m-1 p-4 text-sm text-gray-500"
      aria-live="polite"
    >
      {/* STEP 1c: Placeholder component (renders only when selected) */}
      {'Element coming soon…'}
    </div>
  )
}

export default Placeholder
