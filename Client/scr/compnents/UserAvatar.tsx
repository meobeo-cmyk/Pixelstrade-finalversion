import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { generatePixelAvatar } from "@/lib/utils";
import { useMemo } from "react";

interface UserAvatarProps {
  username: string;
  className?: string;
}

export function UserAvatar({ username, className }: UserAvatarProps) {
  const svgData = useMemo(() => {
    const svg = generatePixelAvatar(username);
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }, [username]);

  return (
    <Avatar className={className}>
      <AvatarImage src={svgData} alt={username} />
      <AvatarFallback className="bg-primary">
        {username.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

export default UserAvatar;
