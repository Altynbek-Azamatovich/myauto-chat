import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft } from "lucide-react";
import carOwnerImage from "@/assets/role-car-owner.png";
import partnerImage from "@/assets/role-partner.png";

const RoleSelection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleRoleSelection = (role: 'user' | 'partner') => {
    // Store selected role and redirect to auth
    localStorage.setItem('pending_role', role);
    navigate('/phone-auth');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      <Button
        variant="ghost"
        onClick={() => navigate('/welcome')}
        className="self-start mb-8"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        {t('back')}
      </Button>

      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
        <h1 className="text-xl font-bold text-foreground mb-8 text-center">
          {t('roleSelectionTitle')}
        </h1>

        <div className="flex gap-6 w-full justify-center items-stretch">
          {/* User Role - Автовладелец */}
          <Card 
            className="relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary group flex-1 max-w-xs flex flex-col"
            onClick={() => handleRoleSelection('user')}
          >
            <div className="relative flex flex-col h-full">
              <div className="w-full h-36 overflow-hidden">
                <img 
                  src={carOwnerImage} 
                  alt="Car Owner" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5 flex flex-col items-center text-center flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h2 className="text-base font-bold text-foreground">
                    {t('carOwner')}
                  </h2>
                  <p className="text-xs text-muted-foreground whitespace-pre-line">
                    {t('carOwnerDesc')}
                  </p>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRoleSelection('user');
                  }}
                  className="w-full mt-4"
                >
                  Продолжить
                </Button>
              </div>
            </div>
          </Card>

          {/* Partner Role - Партнер Автосервис */}
          <Card 
            className="relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary group flex-1 max-w-xs flex flex-col"
            onClick={() => handleRoleSelection('partner')}
          >
            <div className="relative flex flex-col h-full">
              <div className="w-full h-36 overflow-hidden">
                <img 
                  src={partnerImage} 
                  alt="Partner" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5 flex flex-col items-center text-center flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h2 className="text-base font-bold text-foreground">
                    {t('partner')}
                  </h2>
                  <p className="text-xs text-muted-foreground whitespace-pre-line">
                    {t('partnerDesc')}
                  </p>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRoleSelection('partner');
                  }}
                  className="w-full mt-4"
                >
                  Продолжить
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
