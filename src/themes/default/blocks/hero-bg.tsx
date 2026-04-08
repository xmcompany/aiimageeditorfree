'use client'

import React, { Suspense, lazy } from 'react'

const Spline = lazy(() => import('@splinetool/react-spline'))

// Fallback component for when Spline is loading
function SplineFallback() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.05),transparent_50%)]" />
    </div>
  )
}

export default function HeroBg() {
  return (
    <div className="absolute inset-0 z-0">
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <Suspense fallback={<SplineFallback />}>
          <Spline
            style={{
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
            scene="https://prod.spline.design/us3ALejTXl6usHZ7/scene.splinecode"
          />
        </Suspense>

        {/* Enhanced gradient overlay for better text readability */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `
              linear-gradient(to right, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.3) 25%, rgba(0, 0, 0, 0.3) 75%, rgba(0, 0, 0, 0.8)),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, transparent 30%, transparent 60%, rgba(0, 0, 0, 0.9))
            `,
            pointerEvents: 'none',
          }}
        />

        {/* Additional shadow layer for enhanced text contrast */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `
              radial-gradient(circle at center, transparent 20%, rgba(0, 0, 0, 0.2) 60%, rgba(0, 0, 0, 0.4) 100%)
            `,
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  )
}
