"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { fonts } from "@/lib/fonts"
import styles from "./ForEveryYou.module.css"

type OccasionRow = {
  _id: string
  occasionname: string
  slug?: string
  image?: string
  description?: string
}

type Layout = { visible: number; cardW: number; cardH: number; stageH: number; sw: number }

type Pos = { dx: number; dz: number; ry: number; sc: number; bl: number; op: number; zi: number }

function makePOS(visible: number, cardW: number): Pos[] {
  const gap = Math.round(
    cardW * (visible === 7 ? 0.78 : visible === 5 ? 0.7 : visible === 3 ? 0.58 : 0.54)
  )
  if (visible === 7) {
    return [
      { dx: -gap * 3, dz: -160, ry: 20, sc: 0.62, bl: 6, op: 1.0, zi: 4 },
      { dx: -gap * 2, dz: -85, ry: 13, sc: 0.76, bl: 3, op: 1.0, zi: 6 },
      { dx: -gap, dz: -35, ry: 7, sc: 0.88, bl: 0.8, op: 1.0, zi: 8 },
      { dx: 0, dz: 0, ry: 0, sc: 1.0, bl: 0, op: 1.0, zi: 10 },
      { dx: gap, dz: -35, ry: -7, sc: 0.88, bl: 0.8, op: 1.0, zi: 8 },
      { dx: gap * 2, dz: -85, ry: -13, sc: 0.76, bl: 3, op: 1.0, zi: 6 },
      { dx: gap * 3, dz: -160, ry: -20, sc: 0.62, bl: 6, op: 1.0, zi: 4 },
    ]
  }
  if (visible === 5) {
    return [
      { dx: -gap * 2, dz: -80, ry: 14, sc: 0.76, bl: 3, op: 1.0, zi: 6 },
      { dx: -gap, dz: -32, ry: 8, sc: 0.88, bl: 0.8, op: 1.0, zi: 8 },
      { dx: 0, dz: 0, ry: 0, sc: 1.0, bl: 0, op: 1.0, zi: 10 },
      { dx: gap, dz: -32, ry: -8, sc: 0.88, bl: 0.8, op: 1.0, zi: 8 },
      { dx: gap * 2, dz: -80, ry: -14, sc: 0.76, bl: 3, op: 1.0, zi: 6 },
    ]
  }
  if (visible === 3) {
    return [
      { dx: -gap, dz: -28, ry: 8, sc: 0.86, bl: 0.8, op: 1.0, zi: 8 },
      { dx: 0, dz: 0, ry: 0, sc: 1.0, bl: 0, op: 1.0, zi: 10 },
      { dx: gap, dz: -28, ry: -8, sc: 0.86, bl: 0.8, op: 1.0, zi: 8 },
    ]
  }
  return [{ dx: 0, dz: 0, ry: 0, sc: 1.0, bl: 0, op: 1.0, zi: 10 }]
}

function getLayout(stageW: number): Layout {
  const sw = stageW || (typeof window !== "undefined" ? window.innerWidth : 1200)
  let visible: number
  let cardW: number
  if (sw >= 1100) {
    visible = 7
    cardW = Math.min(300, sw * 0.22)
  } else if (sw >= 720) {
    visible = 5
    cardW = Math.min(250, sw * 0.26)
  } else if (sw >= 480) {
    visible = 3
    cardW = Math.min(210, sw * 0.32)
  } else {
    visible = 1
    cardW = Math.min(280, Math.max(220, Math.round(sw * 0.72)))
  }
  const cardH = Math.round(cardW * 1.62)
  const stageH = cardH + (visible === 1 ? 24 : visible === 3 ? 36 : 48)
  return { visible, cardW, cardH, stageH, sw }
}

export default function ForEveryYou() {
  const router = useRouter()
  const eyebrow = "Shop by Occasion"
  const title = "FOR EVERY YOU"

  const [items, setItems] = useState<OccasionRow[]>([])
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/public/occasions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: "{}",
          cache: "no-store",
        })
        const json = (await res.json()) as { success?: boolean; data?: OccasionRow[] }
        if (cancelled) return
        if (res.ok && json.success && Array.isArray(json.data)) {
          const rows = json.data.filter((r) => r && r._id && r.occasionname?.trim() && r.image?.trim())
          setItems(rows)
          setLoadError(false)
        } else {
          setItems([])
          setLoadError(true)
        }
      } catch {
        if (!cancelled) {
          setItems([])
          setLoadError(true)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const stageWrapRef = useRef<HTMLDivElement>(null)
  const [cur, setCur] = useState(0)
  const [busy, setBusy] = useState(false)
  const [layout, setLayout] = useState<Layout>(() => getLayout(1200))

  const N = items.length

  const measure = useCallback(() => {
    const el = stageWrapRef.current
    const w = el?.offsetWidth ?? (typeof window !== "undefined" ? window.innerWidth : 1200)
    setLayout(getLayout(w))
  }, [])

  useLayoutEffect(() => {
    measure()
  }, [measure, N])

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(t)
      t = setTimeout(measure, 120)
    }
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
      clearTimeout(t)
    }
  }, [measure])

  const getrel = useCallback(
    (i: number) => {
      let d = i - cur
      if (d > Math.floor(N / 2)) d -= N
      if (d < -Math.floor(N / 2)) d += N
      return d
    },
    [cur, N]
  )

  const goTo = useCallback(
    (idx: number) => {
      if (busy || N === 0) return
      setBusy(true)
      setCur(((idx % N) + N) % N)
      window.setTimeout(() => setBusy(false), 580)
    },
    [busy, N]
  )

  const { visible, cardW, cardH, stageH } = layout
  const half = Math.floor(visible / 2)
  const POS = makePOS(visible, cardW)

  if (loadError || N === 0) return null

  return (
    <section className={`${styles.section} ${fonts.body}`}>
      <div className={`${styles.inner} mx-auto w-full max-w-[1400px] px-4 sm:px-5 md:px-6`}>
        <div className={styles.top}>
          <div className={styles.eyebrow}>{eyebrow}</div>
          <h2 className={`mb-0 text-center text-3xl font-light tracking-[0.08em] sm:text-4xl md:text-5xl font-[family-name:var(--font-nunito)]`}>{title}</h2>
        </div>

        <div ref={stageWrapRef} className={styles.stageWrap} style={{ height: stageH }}>
          <div
            className={styles.scene}
            role="presentation"
            onMouseDown={(e) => {
              if ((e.target as HTMLElement).closest("button")) return
              ;(e.currentTarget as HTMLElement).dataset.dragDown = String(e.clientX)
            }}
            onMouseUp={(e) => {
              const start = (e.currentTarget as HTMLElement).dataset.dragDown
              delete (e.currentTarget as HTMLElement).dataset.dragDown
              if (start == null || (e.target as HTMLElement).closest("button")) return
              const d = Number(start) - e.clientX
              if (Math.abs(d) > 50) goTo(d > 0 ? cur + 1 : cur - 1)
            }}
            onTouchStart={(e) => {
              ;(e.currentTarget as HTMLElement).dataset.tx = String(e.touches[0].clientX)
            }}
            onTouchEnd={(e) => {
              const tx = (e.currentTarget as HTMLElement).dataset.tx
              delete (e.currentTarget as HTMLElement).dataset.tx
              if (tx == null) return
              const d = Number(tx) - e.changedTouches[0].clientX
              if (Math.abs(d) > 40) goTo(d > 0 ? cur + 1 : cur - 1)
            }}
          >
            <button type="button" className={`${styles.nbtn} ${styles.btnL}`} aria-label="Previous" onClick={() => goTo(cur - 1)}>
              <svg viewBox="0 0 14 14">
                <polyline points="9,2 4,7 9,12" />
              </svg>
            </button>

            {items.map((item, i) => {
              const r = getrel(i)
              const a = Math.abs(r)
              let hidden = a > half
              let p: Pos | undefined
              if (!hidden) {
                p = POS[r + half]
                if (!p) hidden = true
              }

              return (
                <div
                  key={item._id}
                  className={`${styles.cardWrap} ${r === 0 ? styles.active : ""}`}
                  style={
                    hidden
                      ? {
                          opacity: 0,
                          pointerEvents: "none",
                          zIndex: 0,
                          width: cardW,
                          transform: "translateX(0) translateZ(0) rotateY(0deg) scale(1)",
                          filter: "none",
                        }
                      : {
                          opacity: p!.op,
                          zIndex: p!.zi,
                          pointerEvents: "auto",
                          width: cardW,
                          filter: p!.bl > 0 ? `blur(${p!.bl}px)` : "none",
                          transform: `translateX(${p!.dx}px) translateZ(${p!.dz}px) rotateY(${p!.ry}deg) scale(${p!.sc})`,
                        }
                  }
                  onClick={() => {
                    if (busy) return
                    const rel = getrel(i)
                    if (rel !== 0) {
                      goTo(cur + rel)
                      return
                    }
                    router.push(`/promo?occasion=${encodeURIComponent(item._id)}`)
                  }}
                >
                  <div
                    className={styles.cardInner}
                    style={{ width: cardW, height: cardH, boxShadow: "none" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- remote CMS URLs */}
                    <img className={styles.cardImg} src={item.image} alt={item.occasionname} loading="lazy" />
                    <div className={styles.overlay} />
                    <div className={styles.nameOnImage}>{item.occasionname}</div>
                  </div>
                </div>
              )
            })}

            <button type="button" className={`${styles.nbtn} ${styles.btnR}`} aria-label="Next" onClick={() => goTo(cur + 1)}>
              <svg viewBox="0 0 14 14">
                <polyline points="5,2 10,7 5,12" />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </section>
  )
}
