export default function HeadingComponent({ firstPart, secondPart }: { firstPart?: string, secondPart?: string }) {
    return (
        <h1 className="text-2xl text-center">
            <span className="font-medium">{firstPart}</span>            
            <span className="font-semibold">{secondPart}</span>
        </h1>
    )
}