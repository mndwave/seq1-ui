// Assuming the component should use shadcn/ui's Label and Input components.
// This is the recommended approach for consistency within the SEQ1 project.

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface Props {
  label: string
  id: string
  placeholder?: string
  type?: string
}

const MyComponent = ({ label, id, placeholder, type = "text" }: Props) => {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input type={type} id={id} placeholder={placeholder} />
    </div>
  )
}

export default MyComponent
