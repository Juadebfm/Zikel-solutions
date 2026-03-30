import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import {
  formsService,
  type CreateFormPayload,
  type FormAccessRules,
  type FormBuilderSchema,
  type FormListParams,
  type FormSubmissionPayload,
  type FormTriggerRules,
  type UpdateFormPayload,
} from "@/services/forms.service"

export function useFormList(params?: FormListParams) {
  const resolvedParams = {
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 20,
    search: params?.search,
    status: params?.status,
    category: params?.category,
  }

  return useQuery({
    queryKey: queryKeys.forms.list(resolvedParams),
    queryFn: () => formsService.list(resolvedParams),
    placeholderData: keepPreviousData,
  })
}

export function useFormDetail(formId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.forms.detail(formId),
    queryFn: () => formsService.getDetail(formId),
    enabled: enabled && Boolean(formId),
  })
}

export function useFormMetadata() {
  return useQuery({
    queryKey: queryKeys.forms.metadata,
    queryFn: () => formsService.getMetadata(),
    staleTime: 10 * 60 * 1000,
  })
}

export function useCreateForm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateFormPayload) => formsService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["forms", "list"] })
    },
  })
}

export function useUpdateForm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ formId, payload }: { formId: string; payload: UpdateFormPayload }) =>
      formsService.update(formId, payload),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["forms", "list"] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.forms.detail(variables.formId) }),
      ])
    },
  })
}

export function useUpdateFormAccess() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ formId, access }: { formId: string; access: FormAccessRules }) =>
      formsService.updateAccess(formId, access),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.forms.detail(variables.formId) })
    },
  })
}

export function useUpdateFormBuilder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ formId, builder }: { formId: string; builder: FormBuilderSchema }) =>
      formsService.updateBuilder(formId, builder),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.forms.detail(variables.formId) })
    },
  })
}

export function useUpdateFormTrigger() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ formId, trigger }: { formId: string; trigger: FormTriggerRules }) =>
      formsService.updateTrigger(formId, trigger),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.forms.detail(variables.formId) })
    },
  })
}

export function useFormPreview() {
  return useMutation({
    mutationFn: (formId: string) => formsService.preview(formId),
  })
}

export function usePublishForm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formId: string) => formsService.publish(formId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["forms"] })
    },
  })
}

export function useArchiveForm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formId: string) => formsService.archive(formId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["forms"] })
    },
  })
}

export function useCloneForm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formId: string) => formsService.clone(formId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["forms", "list"] })
    },
  })
}

export function useFormSubmission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ formId, payload }: { formId: string; payload: FormSubmissionPayload }) =>
      formsService.submit(formId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["tasks", "list"] }),
        queryClient.invalidateQueries({ queryKey: ["summary"] }),
      ])
    },
  })
}
