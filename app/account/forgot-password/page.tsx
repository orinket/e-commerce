"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowLeft, ArrowRight, Check, Sparkles, Inbox } from "lucide-react"
import Header from "@/components/orinket/Header"
import Footer from "@/components/orinket/Footer"
import { font } from "@/lib/fonts"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
  }

  const inputClass =
    `w-full rounded-xl border border-border/70 bg-white/90 py-3.5 pl-12 pr-4 text-sm text-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none transition-all placeholder:text-muted-foreground/70 focus:border-gold/60 focus:bg-white focus:shadow-[0_0_0_3px_rgba(180,140,60,0.12)] ${font('body')}`

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="relative flex flex-1 flex-col overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cream/90 via-background to-cream-dark/25"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-1/4 top-0 h-[min(70vh,520px)] w-[min(90vw,640px)] rounded-full opacity-[0.35] blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse at center, color-mix(in oklab, var(--gold) 22%, transparent), transparent 65%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-1/4 bottom-0 h-[min(50vh,400px)] w-[min(80vw,480px)] rounded-full opacity-25 blur-3xl"
          style={{
            background: "radial-gradient(ellipse at center, rgba(120,90,40,0.2), transparent 60%)",
          }}
          aria-hidden
        />

        <div className="relative z-[1] flex flex-1 items-center justify-center px-4 py-14 sm:py-20">
          <div className="w-full max-w-[440px]">
            <Link
              href="/account"
              className={`mb-6 inline-flex items-center gap-2.5 rounded-full border border-border/50 bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:border-gold/35 hover:bg-white hover:text-foreground ${font('buttons')}`}
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
              Back to sign in
            </Link>

            <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-b from-card via-card to-cream/30 shadow-[0_28px_64px_-24px_rgba(28,22,16,0.22),0_0_0_1px_rgba(255,255,255,0.6)_inset] ring-1 ring-black/[0.04]">
              <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gold/5 blur-2xl" aria-hidden />
              <div className="absolute -left-12 bottom-0 h-32 w-32 rounded-full bg-gold-dark/5 blur-2xl" aria-hidden />

              <div className="relative px-6 pb-10 pt-9 sm:px-10 sm:pt-11">
                {!isSubmitted ? (
                  <>
                    <div className="mb-8 text-center">
                      <div className={`mb-4 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gradient-to-r from-gold/10 to-cream/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-dark shadow-sm ${font('labels')}`}>
                        <Sparkles className="h-3 w-3 text-gold" strokeWidth={2} />
                        Account security
                      </div>
                      <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                        Forgot your password?
                      </h1>
                      <p className={`mt-3 text-sm leading-relaxed text-muted-foreground ${font('body')}`}>
                        Enter the email on your Orinket account. We&apos;ll send a secure link to choose a new password.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className={`mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/80 ${font('labels')}`}>
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/80" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            className={inputClass}
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className={`group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-foreground via-stone-800 to-stone-900 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_12px_28px_-8px_rgba(25,18,14,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-8px_rgba(25,18,14,0.55)] active:translate-y-0 ${font('buttons')}`}
                      >
                        Send reset link
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </form>

                    <p className={`mt-8 text-center text-xs leading-relaxed text-muted-foreground ${font('body')}`}>
                      Remembered your password?{" "}
                      <Link href="/account" className="font-semibold text-foreground underline-offset-4 hover:underline">
                        Sign in
                      </Link>
                    </p>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="mb-6 flex justify-center">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-emerald-200/40 blur-xl" aria-hidden />
                        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white shadow-[0_12px_28px_-8px_rgba(5,80,50,0.2)] ring-1 ring-white">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-700 shadow-inner">
                            <Check className="h-7 w-7 text-white" strokeWidth={2.5} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={`mb-2 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-cream/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-dark ${font('labels')}`}>
                      <Inbox className="h-3.5 w-3.5 text-gold" strokeWidth={2} />
                      Email sent
                    </div>

                    <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-[1.65rem]">
                      Check your inbox
                    </h1>
                    <p className={`mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground ${font('body')}`}>
                      If an account exists for{" "}
                      <span className="font-semibold text-foreground">{email || "that address"}</span>, we&apos;ve sent a
                      password reset link. The link expires in 24 hours for your security.
                    </p>

                    <p className={`mt-4 text-xs text-muted-foreground ${font('body')}`}>
                      Didn&apos;t find it? Check spam or promotions, then try again.
                    </p>

                    <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
                      <Link
                        href="/account"
                        className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-foreground via-stone-800 to-stone-900 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_12px_28px_-8px_rgba(25,18,14,0.4)] transition-all hover:-translate-y-0.5 ${font('buttons')}`}
                      >
                        Back to sign in
                      </Link>
                      <button
                        type="button"
                        onClick={() => setIsSubmitted(false)}
                        className={`inline-flex items-center justify-center rounded-xl border border-border/70 bg-white/80 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground transition-colors hover:border-gold/40 hover:bg-cream/50 ${font('buttons')}`}
                      >
                        Use a different email
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p className={`mt-8 text-center text-[11px] leading-relaxed text-muted-foreground/90 ${font('body')}`}>
              Secure link · Encrypted · Orinket never asks for your password by email
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
