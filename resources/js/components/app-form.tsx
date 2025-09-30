
const AppForm = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="bg-background mx-auto mt-10 p-8 border-2 border-border rounded w-full max-w-xl">
      {children}
    </section>
  )
}

export default AppForm