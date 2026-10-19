import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

const buttonVariants = cva('inline-flex items-center justify-center disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97938]', { variants: { variant: { primary: 'bg-[#D97938] text-[#140D0A]', ghost: 'bg-transparent text-[#D97938]' } }, defaultVariants: { variant: 'primary' } })
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean }
export function Button({ asChild, variant, className, ...props }: ButtonProps) { const Component = asChild ? Slot : 'button'; return <Component className={cn(buttonVariants({ variant }), className)} {...props} /> }
