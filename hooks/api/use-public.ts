import { useMutation } from "@tanstack/react-query"

import {
  publicService,
  type BookDemoInput,
  type JoinWaitlistInput,
  type ContactUsInput,
} from "@/services/public.service"

export function useBookDemo() {
  return useMutation({
    mutationFn: (input: BookDemoInput) => publicService.bookDemo(input),
  })
}

export function useJoinWaitlist() {
  return useMutation({
    mutationFn: (input: JoinWaitlistInput) => publicService.joinWaitlist(input),
  })
}

export function useContactUs() {
  return useMutation({
    mutationFn: (input: ContactUsInput) => publicService.contactUs(input),
  })
}
