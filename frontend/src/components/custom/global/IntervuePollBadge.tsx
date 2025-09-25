import { Badge } from "@/components/ui/badge";

export default function BadgeComponent() {
    return (
        <Badge variant="default" className="bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] rounded-xl">
            <span>
                <img src="src/assets/home/Intervue Poll Icon.svg" alt="icon" />
            </span>
            <span className="text-sm">Intervue Poll</span>
        </Badge>
    )
}