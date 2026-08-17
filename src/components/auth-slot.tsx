import { Link } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { signOut } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

export function AuthSlot() {
  const { user, isPending } = useCurrentUserState();

  if (isPending) {
    return <div className="h-11 w-28 animate-pulse rounded-md bg-elevated" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/login">Sign in</Link>
        </Button>
        <Button size="sm" asChild>
          <Link to="/signup">Join</Link>
        </Button>
      </div>
    );
  }

  const label = user.displayName ?? user.primaryEmail ?? "Member";
  const initial = label.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <Link
        to="/studio"
        className="hidden items-center gap-2 text-sm text-muted transition-colors duration-150 hover:text-fg sm:flex"
      >
        {user.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt=""
            className="size-8 rounded-full object-cover"
          />
        ) : (
          <span className="grid size-8 place-items-center rounded-full bg-elevated text-xs text-accent">
            {initial}
          </span>
        )}
        <span className="max-w-32 truncate">{label}</span>
      </Link>
      <Button variant="outline" size="sm" type="button" onClick={() => void signOut()}>
        Sign out
      </Button>
    </div>
  );
}
