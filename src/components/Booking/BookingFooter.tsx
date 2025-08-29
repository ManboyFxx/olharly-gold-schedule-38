
import { getDomainInfo } from '@/lib/domain';

interface BookingFooterProps {
  organizationSlug: string;
}

export const BookingFooter = ({ organizationSlug }: BookingFooterProps) => {
  return (
    <footer className="bg-[#FDFCFB] border-t border-[#E8E4E0] py-4">
      <div className="max-w-md mx-auto px-4 text-center">
        <p className="text-xs text-[#2A2621]/50">
          {getDomainInfo().hostname}/{organizationSlug}
        </p>
      </div>
    </footer>
  );
};
