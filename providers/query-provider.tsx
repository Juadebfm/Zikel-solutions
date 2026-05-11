"use client"

import { useEffect, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { registerBillingGateListener } from "@/lib/api/client"
import { queryKeys } from "@/lib/query-keys"

interface QueryProviderProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  )

  useEffect(() => {
    return registerBillingGateListener(() => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.subscription })
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.quota })
    })
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
