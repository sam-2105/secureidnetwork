import React, { useState } from 'react';
import Header from './components/Header';
import RoleSwitcher from './components/RoleSwitcher';
import IssuerView from './views/IssuerView';
import UserView from './views/UserView';
import VerifierView from './views/VerifierView';
import MonitorView from './views/MonitorView';
import { Role } from './types';
import NetworkStatus from './components/NetworkStatus';

const App: React.FC = () => {
  const [role, setRole] = useState<Role>(Role.ISSUER);

  const renderCurrentView = () => {
    switch (role) {
      case Role.ISSUER:
        return <IssuerView />;
      case Role.USER:
        return <UserView />;
      case Role.VERIFIER:
        return <VerifierView />;
      case Role.MONITOR:
        return <MonitorView />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-start p-4 sm:p-8">
      <div className="app-container flex flex-col items-center mt-10 md:mt-16">
        <Header />
        <RoleSwitcher currentRole={role} onRoleChange={setRole} />

        <div key={role} className="w-full mt-4 animate-fade-in">
          {renderCurrentView()}
        </div>
      </div>
      <NetworkStatus />
    </div>
  );
};

export default App;