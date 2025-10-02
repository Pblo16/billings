const AppForm = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="bg-background mx-auto p-8 border-2 border-border rounded w-full max-w-7xl">
      {children}
    </section>
  )
}

export default AppForm
