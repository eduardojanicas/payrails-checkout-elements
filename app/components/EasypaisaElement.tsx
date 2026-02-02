"use client"
/**
 * EasypaisaElement
 * ---------------------------------------------------------------------------
 * Wraps the Payrails generic redirect element mount target for Easypaisa payments.
 * Stays mounted (hidden when not selected) to avoid remount churn.
 * Shows simple status messaging/spinners.
 */
import React from 'react'
import Spinner from './Spinner'

export type EasypaisaElementStatus = 'idle' | 'loading' | 'ready' | 'error'

type MountRef = React.RefObject<HTMLDivElement> | ((node: HTMLDivElement | null) => void)

interface EasypaisaElementProps {
  status: EasypaisaElementStatus
  error?: string | null
  mountRef: MountRef
}

export const EasypaisaElement: React.FC<EasypaisaElementProps> = ({ status, error, mountRef }) => {
  return (
    <div
      id="easypaisa-button-container"
      ref={mountRef}
      className="rounded-md mt-2 flex justify-end"
      aria-live="polite"
    >
      {status === 'loading' && <Spinner label="Loading Easypaisa" />}
      {status === 'idle' && <Spinner label="Preparing SDK" size="sm" />}
      {status === 'error' && (
        <p className="text-sm text-red-600">Failed to load Easypaisa payment.{error ? ` (${error})` : ''}</p>
      )}
      {/* Easypaisa redirect button mounts here when status transitions to ready */}
    </div>
  )
}

export default EasypaisaElement
