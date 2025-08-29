
import { getDomainInfo, getOrganizationSlug } from '@/lib/domain';
import { PublicBookingWrapper } from '@/components/Booking/PublicBookingWrapper';
import { BookingNotFound } from '@/components/Booking/BookingNotFound';

const PublicBooking = () => {
  const domainInfo = getDomainInfo();
  const organizationSlug = getOrganizationSlug();
  
  // Debug info for development
  if (process.env.NODE_ENV === 'development') {
    console.log('Domain info:', domainInfo);
    console.log('Organization slug:', organizationSlug);
  }
  
  // Se não tem slug, mostra erro
  if (!organizationSlug) {
    return <BookingNotFound />;
  }

  return <PublicBookingWrapper organizationSlug={organizationSlug} />;
};

export default PublicBooking;
