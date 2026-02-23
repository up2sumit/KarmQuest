import { useEffect } from "react"
import { useStore } from "../store"

const STORAGE_KEY = "karmquest-app-state"
const APP_VERSION = "1.0.0"

type PersistedState = {
  version: string
  state: any
}

export function useAppPersistence() {
  const store = useStore()

  // Restore state on first load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return

      const parsed: PersistedState = JSON.parse(raw)

      if (parsed.version !== APP_VERSION) {
        console.warn("App version changed. Skipping restore.")
        return
      }

      store.setState(parsed.state)
    } catch (err) {
      console.error("Failed to restore state:", err)
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  // Save state on every change
  useEffect(() => {
    const unsubscribe = useStore.subscribe((state) => {
      const data: PersistedState = {
        version: APP_VERSION,
        state
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } catch (err) {
        console.error("Failed to persist state:", err)
      }
    })

    return unsubscribe
  }, [])
}
