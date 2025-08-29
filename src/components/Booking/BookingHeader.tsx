
interface Organization {
  id: string;
  name: string;
  logo_url?: string;
}

interface Professional {
  id: string;
  full_name: string;
  title?: string;
  avatar_url?: string;
  bio?: string;
}

interface BookingHeaderProps {
  organization: Organization;
  selectedProfessional?: Professional;
}

export const BookingHeader = ({ organization, selectedProfessional }: BookingHeaderProps) => {
  return (
    <header className="bg-white border-b border-[#E8E4E0]/30 py-6 sm:py-8">
      <div className="max-w-sm sm:max-w-md mx-auto px-4 text-center">
        {organization.logo_url ? (
          <div className="mb-4">
            <img
              src={organization.logo_url}
              alt={organization.name}
              className="h-10 sm:h-12 mx-auto mb-2"
            />
            <h1 className="text-lg sm:text-xl font-semibold text-[#2A2621]">
              {organization.name}
            </h1>
          </div>
        ) : (
          <h1 className="text-xl sm:text-2xl font-bold text-[#2A2621] mb-3">
            {organization.name}
          </h1>
        )}
        
        {selectedProfessional ? (
          <div className="mb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              {selectedProfessional.avatar_url ? (
                <img
                  src={selectedProfessional.avatar_url}
                  alt={selectedProfessional.full_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-[#E8E4E0] rounded-full flex items-center justify-center">
                  <span className="text-[#2A2621]/50 font-medium">
                    {selectedProfessional.full_name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="text-left">
                <h2 className="text-lg font-semibold text-[#2A2621]">
                  {selectedProfessional.full_name}
                </h2>
                {selectedProfessional.title && (
                  <p className="text-sm text-[#2A2621]/70">
                    {selectedProfessional.title}
                  </p>
                )}
              </div>
            </div>
            <p className="text-[#2A2621]/70 text-sm">
              Agende seu horário com este profissional
            </p>
          </div>
        ) : (
          <p className="text-[#2A2621]/70 text-sm sm:text-base">
            Agende seu horário de forma rápida e fácil
          </p>
        )}
      </div>
    </header>
  );
};
