"use client"

import { useEffect, useState } from "react"
import { auth } from "@/lib/firebase"

export function FirebaseInit() {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Check if auth is available
    if (auth) {
      setInitialized(true)
    }
  }, [])

  return null // This component doesn't render anything
}

