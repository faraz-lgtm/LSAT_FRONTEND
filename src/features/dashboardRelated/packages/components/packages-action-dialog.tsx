import { Badge } from '@/components/dashboard/ui/badge'
import { Button } from '@/components/dashboard/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/dashboard/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/dashboard/ui/form'
import { Input } from '@/components/dashboard/ui/input'
import { Textarea } from '@/components/dashboard/ui/textarea'
import {
  useCreateProductMutation,
  useUpdateProductMutation
} from '@/redux/apiSlices/Product/productSlice'
import type { CreateProductInput, ProductOutput, UpdateProductInput } from '@/types/api/data-contracts'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().min(0, 'Price must be non-negative'),
  save: z.number().min(0, 'Save must be non-negative').optional(),
  Duration: z.string().min(1, 'Duration is required'),
  Description: z.string().min(1, 'Description is required'),
  badgeText: z.string().optional(),
  badgeColor: z.string().optional(),
})

type ProductForm = z.infer<typeof productSchema>

type PackageActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: ProductOutput | null
}

export function PackagesActionDialog({
  open,
  onOpenChange,
  currentRow,
}: PackageActionDialogProps) {
  const isEdit = !!currentRow
  
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation()
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation()


  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: 0,
      save: 0,
      Duration: '',
      Description: '',
      badgeText: '',
      badgeColor: '#3b82f6', // Default blue color
    },
  })

  // Reset form when dialog opens/closes or currentRow changes
  useEffect(() => {
    if (open) {
      if (isEdit && currentRow) {
        form.reset({
          name: currentRow.name,
          price: currentRow.price,
          save: currentRow.save || 0,
          Duration: currentRow.Duration,
          Description: currentRow.Description,
          badgeText: currentRow.badge?.text || '',
          badgeColor: currentRow.badge?.color || '#3b82f6',
        })
      } else {
        form.reset({
          name: '',
          price: 0,
          save: 0,
          Duration: '',
          Description: '',
          badgeText: '',
          badgeColor: '#3b82f6',
        })
      }
    }
  }, [open, isEdit, currentRow, form])

  const onSubmit = async (values: ProductForm) => {
    try {
      const productData: CreateProductInput | UpdateProductInput = {
        name: values.name,
        price: values.price,
        save: values.save || 0,
        Duration: values.Duration,
        Description: values.Description,
        badge: values.badgeText && values.badgeColor ? {
          text: values.badgeText,
          color: values.badgeColor, // Store hex color directly
        } : undefined,
      }

      if (isEdit && currentRow) {
        await updateProduct({
          id: currentRow.id,
          data: productData as UpdateProductInput,
        }).unwrap()
        toast.success('Package updated successfully!')
      } else {
        await createProduct(productData as CreateProductInput).unwrap()
        toast.success('Package created successfully!')
      }

      form.reset()
      onOpenChange(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error?.data?.error?.message || `Failed to ${isEdit ? 'update' : 'create'} package`)
    }
  }

  const isLoading = isCreating || isUpdating

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Package' : 'Create New Package'}
          </DialogTitle>
          <DialogDescription>
            {isEdit 
              ? 'Update the package information below.' 
              : 'Fill in the details to create a new package.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 60-Minute Single Prep" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01"
                        placeholder="125" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="save"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Save Amount ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01"
                        placeholder="75" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="Duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 60 minutes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="Description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the package details..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Badge (Optional)</FormLabel>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="badgeText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Badge Text</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Most Popular" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="badgeColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Badge Color</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            {...field}
                            className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                            defaultValue="#3b82f6"
                          />
                          <Input 
                            placeholder="#3b82f6" 
                            {...field}
                            className="flex-1"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {form.watch('badgeText') && form.watch('badgeColor') && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Preview:</span>
                  <Badge 
                    style={{ 
                      backgroundColor: form.watch('badgeColor'),
                      color: '#ffffff',
                      border: 'none'
                    }}
                    className="px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {form.watch('badgeText')}
                  </Badge>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : (isEdit ? 'Update Package' : 'Create Package')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
