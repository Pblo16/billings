const AppForm = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <section
      className={`bg-background mx-auto mt-4 p-2 md:p-8 border-2 border-border max-w-7xl overflow-auto ${className}`}
    >
      {children}
    </section>
  )
}

export default AppForm
