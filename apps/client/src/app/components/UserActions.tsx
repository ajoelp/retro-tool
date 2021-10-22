import { useAuth } from '../contexts/AuthProvider';

type UserActionsProps = {
  className?: string;
};

export function UserActions({ className }: UserActionsProps) {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className={className}>
      <img
        className="inline-block h-6 w-6 rounded-full border shadow-sm"
        src={user.avatar}
        alt={user.githubNickname}
      />
    </div>
  );
}
