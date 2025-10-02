import { Input } from '@/components/ui/input' // Adjust path as needed

interface InputWithIconProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ElementType // Type for the icon component
}

export function InputWithIcon({ icon: Icon, ...props }: InputWithIconProps) {
  return (
    <div className="relative flex items-center">
      <Icon className="left-3 absolute w-4 h-4 text-muted-foreground" />
      <Input className="pl-10" {...props} />
    </div>
  )
}
