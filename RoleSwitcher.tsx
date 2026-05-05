import React, { useState, useEffect, useRef } from 'react';
import { Role } from '../types';
import { UploadCloudIcon, UserIcon, ShieldCheckIcon, TerminalIcon } from './Icons';

interface RoleSwitcherProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
}

const roles = [
  { id: Role.ISSUER, name: 'Issuer', icon: UploadCloudIcon },
  { id: Role.USER, name: 'Certificate Holder', icon: UserIcon },
  { id: Role.VERIFIER, name: 'Verifier', icon: ShieldCheckIcon },
  { id: Role.MONITOR, name: 'Monitor', icon: TerminalIcon },
];

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentRole, onRoleChange }) => {
  const [sliderStyle, setSliderStyle] = useState({});
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const activeIndex = roles.findIndex(r => r.id === currentRole);
    const activeButton = buttonsRef.current[activeIndex];
    
    if (activeButton) {
      setSliderStyle({
        width: `${activeButton.offsetWidth}px`,
        left: `${activeButton.offsetLeft}px`,
      });
    }
  }, [currentRole]);

  return (
    <div className="role-switcher-container">
      <div className="role-switcher-slider" style={sliderStyle}></div>
      {roles.map((role, index) => {
        const isActive = currentRole === role.id;
        return (
          <button
            key={role.id}
            ref={el => { buttonsRef.current[index] = el; }}
            onClick={() => onRoleChange(role.id)}
            className={`relative z-10 w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 ${
              isActive ? 'text-white' : 'text-slate-300 hover:text-white'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <role.icon className="h-5 w-5" />
            <span>{role.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default RoleSwitcher;