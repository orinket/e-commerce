"use client"

function Block({ h }: { h: string }) {
  return (
    <div className={`w-full ${h} animate-pulse rounded-2xl border border-border bg-cream/60`} />
  )
}

export default function HomePageSkeleton() {
  return (
    <main className="min-h-screen">
      <Block h="h-16" />
      <Block h="h-[45vh] sm:h-[55vh] md:h-[70vh]" />
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        <Block h="h-56" />
        <Block h="h-80" />
        <Block h="h-56" />
        <Block h="h-80" />
        <Block h="h-72" />
        <Block h="h-[28rem]" />
        <Block h="h-[26rem]" />
        <Block h="h-[24rem]" />
        <Block h="h-[26rem]" />
        <Block h="h-80" />
        <Block h="h-[24rem]" />
        <Block h="h-[28rem]" />
      </div>
      <Block h="h-72" />
    </main>
  )
}
