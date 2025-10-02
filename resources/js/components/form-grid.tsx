export default function FormGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="gap-6 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
      {children}
    </div>
  )
}
