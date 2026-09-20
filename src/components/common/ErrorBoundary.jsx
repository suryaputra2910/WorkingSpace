import { Component } from 'react'

// Catches render-time exceptions so a runtime error shows a readable message
// instead of unmounting the whole app into a blank white screen.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="min-h-screen flex items-center justify-center bg-paper p-6">
        <div className="max-w-md w-full bg-white border border-stone/10 rounded-lg shadow-card p-8 text-center space-y-4">
          <h1 className="font-display text-xl font-semibold text-ink">Terjadi kesalahan pada aplikasi</h1>
          <p className="text-sm text-stone break-words">{String(error?.message || error)}</p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              className="px-4 py-2 text-sm rounded-md border border-stone/30 text-ink hover:bg-sand/60"
            >
              Coba lagi
            </button>
            <button
              type="button"
              onClick={() => { window.location.href = '/' }}
              className="px-4 py-2 text-sm rounded-md bg-forest text-white hover:bg-moss"
            >
              Ke beranda
            </button>
          </div>
        </div>
      </div>
    )
  }
}
