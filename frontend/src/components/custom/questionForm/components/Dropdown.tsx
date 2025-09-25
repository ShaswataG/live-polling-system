import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SelectDemoProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
}

export default function SelectDemo({ value, onValueChange, placeholder = "60 seconds" }: SelectDemoProps) {
  return (
    <Select value={value as any} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Poll time</SelectLabel>
          <SelectItem value="60">60 seconds</SelectItem>
          <SelectItem value="120">120 seconds</SelectItem>
          <SelectItem value="180">180 seconds</SelectItem>
          <SelectItem value="240">240 seconds</SelectItem>
          <SelectItem value="300">300 seconds</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
