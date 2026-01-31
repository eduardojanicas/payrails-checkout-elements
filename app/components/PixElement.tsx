"use client"
/**
 * PixElement
 * ---------------------------------------------------------------------------
 * Wraps the Payrails generic redirect element mount target for Pix payments.
 * Stays mounted (hidden when not selected) to avoid remount churn.
 * Shows simple status messaging/spinners.
 */
import React from 'react'
import Spinner from './Spinner'

export type PixElementStatus = 'idle' | 'loading' | 'ready' | 'error'

type MountRef = React.RefObject<HTMLDivElement> | ((node: HTMLDivElement | null) => void)

interface PixElementProps {
  status: PixElementStatus
  error?: string | null
  mountRef: MountRef
}

export const PixElement: React.FC<PixElementProps> = ({ status, error, mountRef }) => {
  return (
    <div
      id="pix-button-container"
      ref={mountRef}
      className="rounded-md mt-2 flex justify-end"
      aria-live="polite"
    >
      {status === 'loading' && <Spinner label="Loading Pix" />}
      {status === 'idle' && <Spinner label="Preparing SDK" size="sm" />}
      {status === 'error' && (
        <p className="text-sm text-red-600">Failed to load Pix payment.{error ? ` (${error})` : ''}</p>
      )}
      {/* Pix redirect button mounts here when status transitions to ready */}
    </div>
  )
}

export default PixElement
