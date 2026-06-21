import { createContext, useContext, useState } from 'react'
import { cn } from '@/utils/helpers'

const TabsContext = createContext(null)

export function Tabs({ defaultValue, value, onValueChange, children, className }) {
  const [internal, setInternal] = useState(defaultValue || '')
  const current = value !== undefined ? value : internal
  const setCurrent = onValueChange || setInternal

  return (
    <TabsContext.Provider value={{ current, setCurrent }}>
      <div className={cn('', className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children, className }) {
  return (
    <div
      role="tablist"
      className={cn(
        'flex gap-1 border-b border-border',
        className
      )}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({ value, children, className, disabled }) {
  const ctx = useContext(TabsContext)
  const active = ctx?.current === value

  return (
    <button
      role="tab"
      aria-selected={active}
      disabled={disabled}
      onClick={() => ctx?.setCurrent(value)}
      className={cn(
        'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
        active
          ? 'border-primary text-primary'
          : 'border-transparent text-text-secondary hover:text-text-primary',
        disabled && 'opacity-40 cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, children, className }) {
  const ctx = useContext(TabsContext)
  if (ctx?.current !== value) return null
  return (
    <div role="tabpanel" className={cn('pt-4', className)}>
      {children}
    </div>
  )
}

export default Tabs
