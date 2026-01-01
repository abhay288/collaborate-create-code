import avsarLogo from "@/assets/avsar-logo.png";
import { Badge } from "@/components/ui/badge";

interface AvsarVerifiedBadgeProps {
  className?: string;
}

const AvsarVerifiedBadge = ({ className = "" }: AvsarVerifiedBadgeProps) => {
  return (
    <Badge 
      variant="outline" 
      className={`bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 text-primary flex items-center gap-1 px-2 py-0.5 ${className}`}
    >
      <img 
        src={avsarLogo} 
        alt="Avsar" 
        className="h-3 w-3 object-contain" 
        loading="lazy"
      />
      <span className="text-[10px] font-medium">Avsar Verified</span>
    </Badge>
  );
};

export default AvsarVerifiedBadge;
