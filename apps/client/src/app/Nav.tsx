import { PlayIcon } from '@heroicons/react/solid';

const Navbar = () => {
  return (
    <div className="w-full h-16 border-b grid grid-cols-12 items-center p-4">
      <div className="col-span-4">
        <p className="text-xl">Title</p>
      </div>
      <div className="flex items-center">
        <p className="mr-2">5:00</p>
        <PlayIcon className="w-7 h-7 text-green-500" />
      </div>
    </div>
  )
};

export { Navbar };
