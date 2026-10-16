"use client"

import Image from "next/image"
import { useCallback, useRef, useState } from "react"
import { MoveHorizontal } from "lucide-react"
import { fonts } from "@/lib/fonts"

interface Product360ViewProps {
  frames: string[]
  productName: string
  className?: string
}

export default function Product360View({
  frames,
  productName,
  className = "",
}: Product360ViewProps) {
  const [angleIndex, setAngleIndex] = useState(0)
  const dragRef = useRef<{ active: boolean; lastX: number }>({ active: false, lastX: 0 })

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { active: true, lastX: e.clientX }
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current.active) return
      const dx = e.clientX - dragRef.current.lastX
      dragRef.current.lastX = e.clientX
      if (Math.abs(dx) < 2) return
      setAngleIndex((i) => {
        const dir = dx > 0 ? 1 : -1
        const next = (i + dir + frames.length) % frames.length
        return next
      })
    },
    [frames.length]
  )

  const endDrag = useCallback(() => {
    dragRef.current.active = false
  }, [])

  if (frames.length < 2) return null

  return (
    <div className={`relative flex flex-col h-full w-full ${className}`}>
      <div
        role="img"
        aria-label={`360 view frame ${angleIndex + 1} of ${frames.length}`}
        className="relative flex-1 cursor-ew-resize touch-pan-y bg-gradient-to-br from-cream-dark/50 to-cream select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        <Image
          src={frames[angleIndex]}
          alt={`${productName} angle ${angleIndex + 1}`}
          fill
          className="object-cover object-top pointer-events-none"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
        
        {/* Rotation indicator */}
        <div className="absolute top-4 right-4 z-[2] flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-[10px] text-foreground shadow-md ring-1 ring-black/5 backdrop-blur-sm">
          <MoveHorizontal className="h-3.5 w-3.5 text-gold-dark" strokeWidth={2} />
          <span className={`${fonts.labels} uppercase tracking-wider`}>Drag to rotate</span>
        </div>

        {/* Frame indicator */}
        <div className={`pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-[10px] text-white backdrop-blur-sm ${fonts.labels}`}>
          <span>
            {angleIndex + 1} / {frames.length}
          </span>
        </div>
      </div>
      
      {/* Rotation slider */}
      <div className="absolute bottom-4 right-4 left-4 z-[2] sm:static sm:mt-auto sm:px-4 sm:py-3 bg-white/40 backdrop-blur-sm sm:bg-transparent rounded-full sm:rounded-none">
        <input
          type="range"
          min={0}
          max={frames.length - 1}
          value={angleIndex}
          onChange={(e) => setAngleIndex(Number(e.target.value))}
          className="h-2 w-full cursor-pointer accent-gold opacity-80 hover:opacity-100 transition-opacity"
          aria-label="Rotate product view"
        />
      </div>
    </div>
  )
}
