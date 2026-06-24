import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import type { User } from '@/shared/types/domain'
import { useUpdateMe } from '../api/profile'
import { ApiError } from '@/shared/lib/api-client'
import { t } from '@/shared/i18n/strings'

const editSchema = z.object({
  name: z.string().min(2, t.validation.nameTooShort),
  description: z.string().max(500, t.validation.descriptionMax),
  photo: z.string().url(t.validation.urlInvalid).or(z.literal('')),
})
type EditInput = z.infer<typeof editSchema>

interface Props {
  user: User
}

export function ProfileEditDialog({ user }: Props) {
  const [open, setOpen] = useState(false)
  const update = useUpdateMe()

  const form = useForm<EditInput>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: user.name,
      description: user.description,
      photo: user.photo ?? '',
    },
  })

  const onSubmit = (input: EditInput) => {
    update.mutate(
      {
        name: input.name,
        description: input.description,
        photo: input.photo === '' ? null : input.photo,
      },
      {
        onSuccess: () => {
          toast.success(t.toasts.profileUpdated)
          setOpen(false)
        },
        onError: (err) => {
          const msg = err instanceof ApiError ? err.message : t.toasts.updateFailed
          toast.error(msg)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{t.profile.editButton}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.profile.editTitle}</DialogTitle>
          <DialogDescription>{t.profile.editDescription}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.common.name}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.profile.about}</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="photo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.profile.photoUrl}</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder={t.profile.photoPlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={update.isPending}>
                {update.isPending ? t.common.saving : t.common.save}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
