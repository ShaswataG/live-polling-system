import IntervuePollBadge from '../global/IntervuePollBadge'

export default function WaitComponent() {
    return (
        <div className='flex flex-col justify-center items-center gap-6 w-2/3 h-full p-4'>
            <IntervuePollBadge />
            <div>
                <p>Loading...</p>
            </div>
            <h1>Wait for the teacher to ask questions..</h1>
        </div>
    )
}