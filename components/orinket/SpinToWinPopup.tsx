"use client"

import { useEffect, useMemo, useState } from "react"
import { Copy, Gift, Sparkles, X } from "lucide-react"
import { font } from "@/lib/fonts"
import { useAuth } from "@/context/AuthContext"

type CheckSpinResponse = {
  success?: boolean
  show_popup?: boolean
}

type SpinResponse = {
  success?: boolean
  reward?: string
  coupon_code?: string
  message?: string
}

/** Clockwise from top, matching reference: cream (even index) / black (odd). */
const REWARD_SEGMENTS = [
  "Buy 2 at 45% off",
  "Maybe next time",
  "Buy 3 at 55% off",
  "No luck today",
  "Flat Rs. 400 off",
  "You didn't win",
  "Flat Rs. 200 off",
  "Try again",
] as const

const rewardToIndex = new Map(
  REWARD_SEGMENTS.map((label, index) => [label, index] as [string, number])
)

const NO_WIN_LABELS = new Set<string>([
  "Maybe next time",
  "No luck today",
  "You didn't win",
  "Try again",
])

const CONFETTI_COLORS = ["#fbbf24", "#f472b6", "#60a5fa", "#34d399", "#fb923c", "#a78bfa", "#f87171"]

function isWinningReward(label: string) {
  return Boolean(label) && !NO_WIN_LABELS.has(label)
}

function emailValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function phoneValid(value: string) {
  return /^[0-9+\-\s()]{8,20}$/.test(value.trim())
}

export default function SpinToWinPopup() {
  const { isLoggedIn } = useAuth()
  const [open, setOpen] = useState(false)
  const [checking, setChecking] = useState(true)
  const [apiSaysShow, setApiSaysShow] = useState(false)
  const [showAfterScroll, setShowAfterScroll] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [spun, setSpun] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")
  const [reward, setReward] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [showResultModal, setShowResultModal] = useState(false)
  const [copiedCoupon, setCopiedCoupon] = useState(false)

  const segmentAngle = 360 / REWARD_SEGMENTS.length
  const isWin = reward ? isWinningReward(reward) : false

  const confettiParticles = useMemo(() => {
    if (!showResultModal || !reward || !isWinningReward(reward)) return []
    return Array.from({ length: 58 }, (_, i) => {
      const base = (Math.PI * 2 * i) / 58
      const angle = base + (Math.random() - 0.5) * 0.35
      const dist = 130 + Math.random() * 140
      return {
        id: i,
        dx: Math.cos(angle - Math.PI / 2) * dist,
        dy: Math.sin(angle - Math.PI / 2) * dist,
        rot: (Math.random() - 0.5) * 720,
        delay: Math.random() * 0.18,
        w: 4 + Math.random() * 7,
        h: 3 + Math.random() * 5,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      }
    })
  }, [showResultModal, reward])

  const wheelBackground = useMemo(() => {
    const slices = REWARD_SEGMENTS.map((_, i) => {
      const start = i * segmentAngle
      const end = (i + 1) * segmentAngle
      const color = i % 2 === 0 ? "#fffdf7" : "#111111"
      return `${color} ${start}deg ${end}deg`
    }).join(", ")
    return `conic-gradient(${slices})`
  }, [segmentAngle])

  useEffect(() => {
    let active = true
    ;(async () => {
      setChecking(true)
      try {
        const res = await fetch("/api/check-spin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        })
        const json = (await res.json().catch(() => ({}))) as CheckSpinResponse
        if (!active) return
        setApiSaysShow(Boolean(json?.show_popup))
      } catch {
        if (!active) return
        setApiSaysShow(false)
      } finally {
        if (active) setChecking(false)
      }
    })()

    return () => {
      active = false
    }
  }, [])

  // Re-evaluate when auth resolves — isLoggedIn starts false, then flips after hydration
  useEffect(() => {
    setShowAfterScroll(apiSaysShow && isLoggedIn)
  }, [apiSaysShow, isLoggedIn])

  useEffect(() => {
    if (!showAfterScroll || open) return

    const minScrollYToShow = 120
    const onScroll = () => {
      if (window.scrollY < minScrollYToShow) return
      setOpen(true)
      setShowAfterScroll(false)
      window.removeEventListener("scroll", onScroll)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [showAfterScroll, open])

  async function handleSpin() {
    setError("")
    if (spinning || spun) return

    if (!emailValid(email)) {
      setError("Please enter a valid email address.")
      return
    }
    if (!phoneValid(phone)) {
      setError("Please enter a valid phone number.")
      return
    }

    setSpinning(true)
    try {
      const res = await fetch("/api/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), phone: phone.trim() }),
      })

      const json = (await res.json().catch(() => ({}))) as SpinResponse
      if (!res.ok || !json?.success || !json.reward) {
        setError(json?.message || "Unable to spin right now. Please try again.")
        setSpinning(false)
        return
      }

      const rewardLabel = json.reward
      const rewardIndex = rewardToIndex.get(rewardLabel) ?? 0
      const stopAt = 360 * 6 - (rewardIndex * segmentAngle + segmentAngle / 2)
      setRotation((prev) => prev + stopAt)

      window.setTimeout(() => {
        setReward(rewardLabel)
        setCouponCode(json.coupon_code || "")
        setSpinning(false)
        setSpun(true)
        setShowResultModal(true)
      }, 3700)
    } catch {
      setError("Unable to spin right now. Please try again.")
      setSpinning(false)
    }
  }

  if (checking) return null
  if (!open && !showResultModal) return null

  return (
    <>
    {open ? (
    <div className="spin-backdrop-in fixed inset-0 z-[100] overflow-y-auto bg-black/50 px-3 py-4 backdrop-blur-[1px] sm:px-4 sm:py-7">
      <div className="flex min-h-full items-center justify-center">
        <div className="spin-modal-in relative my-auto w-full max-w-[460px] overflow-y-auto rounded-2xl bg-gradient-to-r from-[#f9eaea] to-[#f6cfd3] px-4 pb-5 pt-4 shadow-2xl max-h-[calc(100dvh-2rem)] sm:px-6 sm:pb-6 sm:pt-5 sm:max-h-[calc(100dvh-3.5rem)]">
        <button
          type="button"
          aria-label="Close spin popup"
          onClick={() => setOpen(false)}
          className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/40 bg-white text-black hover:bg-black hover:text-white transition sm:right-4 sm:top-4"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-5 mt-3 w-full max-w-[250px] sm:max-w-[320px]">
          <div className="relative aspect-square">
            <div className="absolute left-1/2 top-0 z-10 h-0 w-0 -translate-x-1/2 border-x-[10px] border-x-transparent border-t-[18px] border-t-[#8b2b2b]" />
            <div
              className="absolute inset-0 rounded-full border-[8px] border-[#f7f3eb] shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
              style={{
                background: wheelBackground,
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? "transform 3.6s cubic-bezier(0.2, 0.8, 0.12, 1)" : "none",
              }}
            >
              {REWARD_SEGMENTS.map((label, index) => {
                const textColor = index % 2 === 0 ? "#111111" : "#fefefe"
                /** Bisector angle, clockwise from top — matches conic-gradient slice centers */
                const angleDeg = index * segmentAngle + segmentAngle / 2
                /**
                 * Arm from hub → rim: transform-origin at center, arm lies along slice bisector.
                 * rotate(angleDeg - 90): local +X runs center → outside (top slice → upward, etc.).
                 * Label sits on the arm starting ~12% from hub (near white circle), not mid-wedge.
                 */
                return (
                  <div
                    key={label}
                    className="pointer-events-none absolute left-1/2 top-1/2 h-0"
                    style={{
                      width: "50%",
                      transformOrigin: "0 50%",
                      transform: `translateY(-50%) rotate(${angleDeg - 90}deg)`,
                    }}
                  >
                    <div
                      className="text-center text-[10px] font-bold leading-[1.2] tracking-wide sm:text-[11px]"
                      style={{
                        position: "absolute",
                        left: "12%",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "74%",
                        color: textColor,
                        fontFamily:
                          'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      }}
                    >
                      {label}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white border border-black/20 shadow" />
          </div>
        </div>

        <h2 className={`text-center text-[34px] leading-none text-black sm:text-[44px] ${font("headings")}`}>Spin to Win</h2>
        <p className={`mt-2 text-center text-base leading-6 text-black/85 sm:text-[18px] ${font("body")}`}>
          Enter, spin and unlock exclusive offers
        </p>

        <div className="mt-5 space-y-3">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={spun || spinning}
            className="w-full rounded-md border border-black/10 bg-white px-4 py-3 text-base text-black outline-none focus:border-black/40"
          />
          <input
            type="tel"
            placeholder="Phone No."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={spun || spinning}
            className="w-full rounded-md border border-black/10 bg-white px-4 py-3 text-base text-black outline-none focus:border-black/40"
          />
        </div>

        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}

        <button
          type="button"
          onClick={handleSpin}
          disabled={spinning || spun}
          className={`mt-5 w-full rounded-md border border-black bg-black py-3.5 text-sm tracking-[0.16em] text-white transition ${
            spinning || spun ? "opacity-60 cursor-not-allowed" : "hover:bg-[#1f1f1f]"
          } ${font("buttons")}`}
        >
          {spinning ? "SPINNING..." : spun ? "SPIN COMPLETED" : "SPIN MY WHEEL"}
        </button>
        </div>
      </div>
    </div>
    ) : null}

      {/* Result overlay — win: confetti + reveal; lose: calm “better luck” */}
      {showResultModal && reward ? (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-black/60 px-3 py-6 backdrop-blur-[2px] sm:py-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="spin-result-title"
        >
          <div className="relative my-auto w-full max-w-[400px] overflow-hidden rounded-2xl border border-white/30 bg-gradient-to-b from-[#fff5f5] via-[#fce8ec] to-[#f5d0d8] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] max-h-[calc(100dvh-2rem)] sm:p-8 sm:max-h-[calc(100dvh-4rem)]">
            <button
              type="button"
              aria-label="Close result"
              onClick={() => setShowResultModal(false)}
              className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/25 bg-white/90 text-black hover:bg-black hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            {isWin ? (
              <>
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                  {confettiParticles.map((p) => (
                    <span
                      key={p.id}
                      className="absolute"
                      style={{
                        left: "50%",
                        top: "38%",
                        width: p.w,
                        height: p.h,
                        backgroundColor: p.color,
                        borderRadius: 2,
                        boxShadow: "0 0 6px rgba(255,255,255,0.5)",
                        ["--dx" as string]: `${p.dx}px`,
                        ["--dy" as string]: `${p.dy}px`,
                        ["--rot" as string]: `${p.rot}deg`,
                        animation: `spin-confetti-burst 1.2s ease-out forwards`,
                        animationDelay: `${p.delay}s`,
                      }}
                    />
                  ))}
                  <div className="spin-firework-flash absolute left-[12%] top-[20%] h-24 w-24 rounded-full bg-amber-300/40 blur-2xl" />
                  <div className="spin-firework-flash absolute right-[8%] top-[28%] h-20 w-20 rounded-full bg-pink-400/35 blur-2xl [animation-delay:0.35s]" />
                  <div className="spin-firework-flash absolute left-1/2 top-[12%] h-16 w-16 -translate-x-1/2 rounded-full bg-yellow-200/50 blur-xl [animation-delay:0.2s]" />
                </div>

                <div className="relative text-center">
                  <div className="spin-result-pop mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-lg">
                    <Gift className="h-7 w-7 text-amber-950" strokeWidth={2.2} />
                  </div>
                  <h3
                    id="spin-result-title"
                    className={`spin-result-pop-delay text-2xl font-bold tracking-tight text-black sm:text-3xl ${font("headings")}`}
                  >
                    Congratulations!
                  </h3>
                  <p className={`spin-result-pop-delay mt-1 text-sm text-black/70 ${font("body")}`}>
                    You unlocked an exclusive reward
                  </p>

                  <div
                    className={`spin-result-pop-delay relative mt-6 rounded-xl border-2 border-dashed border-amber-600/50 bg-white/90 px-4 py-5 shadow-inner ${font("body")}`}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-800/80">
                      Your prize
                    </p>
                    <p className="mt-2 text-lg font-bold leading-snug text-black sm:text-xl">{reward}</p>
                    {couponCode ? (
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-center">
                        <code className="rounded-lg bg-black px-3 py-2 font-mono text-sm font-semibold tracking-wider text-white">
                          {couponCode}
                        </code>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(couponCode)
                              setCopiedCoupon(true)
                              window.setTimeout(() => setCopiedCoupon(false), 2000)
                            } catch {
                              /* ignore */
                            }
                          }}
                          className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-black/20 bg-white px-3 py-2 text-xs font-semibold text-black hover:bg-black/5 ${font("labels")}`}
                        >
                          <Copy className="h-3.5 w-3.5" />
                          {copiedCoupon ? "Copied!" : "Copy code"}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </>
            ) : (
              <div className="relative text-center">
                <div className="spin-result-pop mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-md ring-1 ring-black/10">
                  <Sparkles className="h-7 w-7 text-black/50" strokeWidth={2} />
                </div>
                <h3
                  id="spin-result-title"
                  className={`spin-result-pop-delay text-2xl font-bold text-black sm:text-3xl ${font("headings")}`}
                >
                  Better luck next time
                </h3>
                <p className={`spin-result-pop-delay mt-2 text-sm leading-relaxed text-black/70 ${font("body")}`}>
                  This spin landed on{" "}
                  <span className="font-semibold text-black">{reward}</span>. Come back when your next chance is
                  available — we&apos;re cheering for you.
                </p>
                <div
                  className={`spin-result-pop-delay mt-6 rounded-xl border border-black/10 bg-white/80 px-4 py-4 text-left text-sm text-black/80 ${font("body")}`}
                >
                  <p className="text-xs uppercase tracking-wider text-black/50">Tip</p>
                  <p className="mt-1">
                    Check the spin rules on your account or wait for the cooldown — real wins are still waiting on
                    your next visit.
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowResultModal(false)}
              className={`spin-result-pop-delay relative mt-6 w-full rounded-md border border-black bg-black py-3.5 text-sm font-semibold tracking-[0.12em] text-white transition hover:bg-[#1a1a1a] ${font("buttons")}`}
            >
              {isWin ? "AWESOME" : "GOT IT"}
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
