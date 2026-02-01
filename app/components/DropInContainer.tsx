"use client"
/**
 * DropInContainer
 * ---------------------------------------------------------------------------
 * Wraps the Payrails drop-in element mount target. Shows simple status
 * messaging/spinners while the SDK initializes.
 */
import React from 'react'
import Spinner from './Spinner'

export type DropInContainerStatus = 'idle' | 'loading' | 'ready' | 'error'

type MountRef = React.RefObject<HTMLDivElement> | ((node: HTMLDivElement | null) => void)

interface DropInContainerProps {
  status: DropInContainerStatus
  error?: string | null
  mountRef: MountRef
}

export const DropInContainer: React.FC<DropInContainerProps> = ({ status, error, mountRef }) => {
  return (
    <div
      id="drop-in-container"
      ref={mountRef}
      className="rounded-md"
      aria-live="polite"
    >
      {status === 'loading' && <Spinner label="Loading payment" />}
      {status === 'idle' && <Spinner label="Preparing SDK" size="sm" />}
      {status === 'error' && (
        <p className="text-sm text-red-600">Failed to load payment.{error ? ` (${error})` : ''}</p>
      )}
      {/* Payment element mounts here when status transitions to ready */}
    </div>
  )
}

export default DropInContainer
