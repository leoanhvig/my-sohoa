type StatusMessageProps = {
  message: string
  tone: 'error' | 'warning'
}

export function StatusMessage({ message, tone }: StatusMessageProps) {
  const className =
    tone === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-amber-200 bg-amber-50 text-amber-700'

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div
        className={`rounded-md border px-4 py-3 text-sm font-semibold ${className}`}
      >
        {message}
      </div>
    </div>
  )
}
