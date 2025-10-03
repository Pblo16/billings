export default function FormGrid({
  children,
  ext,
}: {
  children: React.ReactNode
  ext?: React.ReactNode
}) {
  return (
    <div className="flex flex-col space-y-6">
      <div className="gap-6 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] grid-rows-[auto,1fr,auto]">
        {children}
      </div>
      <div className="py-4">{ext}</div>
    </div>
  )
}
