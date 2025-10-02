const AppForm = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="bg-background mx-auto p-2 md:p-8 border-2 border-border max-w-7xl overflow-auto">
      {children}
    </section>
  )
}

export default AppForm
