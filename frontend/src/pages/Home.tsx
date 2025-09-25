import { Button } from "@/components/ui/button"
import BadgeComponent from "@/components/custom/global/IntervuePollBadge"
import HeadingComponent from "@/components/custom/global/Heading"

export default function Home() {
    return (
        <>
            <div className="flex flex-col items-center justify-center gap-4 max-w-[600px] mx-auto">
                <BadgeComponent />
                <HeadingComponent firstPart={"Welcome to the "} secondPart={"Live Polling System"} />
                <p className="text-gray-500">Please select the role that best describes you to begin using the live polling system</p>
                <div className="flex justify-center items-center text-left w-full gap-4">
                    <div>
                        <p className="text-xl font-semibold">I’m a Student</p>
                        <p className="text-gray-600">
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry
                        </p>
                    </div>
                    <div>
                        <p className="text-xl font-semibold">I’m a Teacher</p>
                        <p className="text-gray-600">
                            Submit answers and view live poll results in real-time.
                        </p>
                    </div>
                </div>
                <Button className="bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] rounded-3xl focus:outline-none active:outline-none">
                    Continue
                </Button>
            </div>
        </>
    )
}