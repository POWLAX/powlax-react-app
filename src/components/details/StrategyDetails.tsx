'use client'

import React from 'react'

type Props = {
  data: {
    id: string
    title: string
    description?: string
    videoUrl?: string
    tags?: string[]
  }
}

export default function StrategyDetails({ data }: Props) {
  return (
    <article className="space-y-4" data-testid="strategy-details">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">{data.title}</h1>
        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {data.tags.map((t) => (
              <span key={t} className="px-2 py-1 bg-muted rounded">
                {t}
              </span>
            ))}
          </div>
        )}
      </header>

      {data.videoUrl && (
        <div className="aspect-video w-full bg-black/10 rounded overflow-hidden">
          <iframe
            className="w-full h-full"
            src={data.videoUrl}
            title="Strategy video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {data.description && (
        <section>
          <h2 className="text-lg font-semibold">Overview</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.description}</p>
        </section>
      )}
    </article>
  )
}


