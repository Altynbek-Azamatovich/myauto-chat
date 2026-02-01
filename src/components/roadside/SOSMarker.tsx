import { useEffect, useRef } from 'react';

interface SOSMarkerProps {
  ymaps: any;
  map: any;
  position: [number, number];
  avatarUrl: string | null;
  initials: string;
  isOwnRequest: boolean;
  hasResponder: boolean;
  onClick: () => void;
}

export const createSOSMarkerLayout = (ymaps: any) => {
  return ymaps.templateLayoutFactory.createClass(`
    <div class="sos-marker-container" style="position: relative; width: 60px; height: 60px;">
      <!-- Pulsing rings -->
      <div class="sos-pulse-ring" style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80px;
        height: 80px;
        border-radius: 50%;
        border: 3px solid {% if properties.hasResponder %}#22c55e{% else %}#ef4444{% endif %};
        animation: pulse-ring 2s ease-out infinite;
        opacity: 0.5;
      "></div>
      <div class="sos-pulse-ring-2" style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100px;
        height: 100px;
        border-radius: 50%;
        border: 2px solid {% if properties.hasResponder %}#22c55e{% else %}#ef4444{% endif %};
        animation: pulse-ring 2s ease-out infinite 0.5s;
        opacity: 0.3;
      "></div>
      
      <!-- Avatar container -->
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 56px;
        height: 56px;
        border-radius: 50%;
        border: 4px solid {% if properties.hasResponder %}#22c55e{% else %}#ef4444{% endif %};
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        overflow: hidden;
        box-shadow: 0 4px 20px {% if properties.hasResponder %}rgba(34, 197, 94, 0.4){% else %}rgba(239, 68, 68, 0.4){% endif %};
        cursor: pointer;
      ">
        {% if properties.avatarUrl %}
          <img 
            src="{{ properties.avatarUrl }}" 
            style="width: 100%; height: 100%; object-fit: cover;"
            alt="avatar"
          />
        {% else %}
          <div style="
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 18px;
          ">{{ properties.initials }}</div>
        {% endif %}
      </div>
      
      <!-- Checkmark for help on the way -->
      {% if properties.hasResponder %}
        <div style="
          position: absolute;
          bottom: 0;
          right: 0;
          width: 22px;
          height: 22px;
          background: #22c55e;
          border-radius: 50%;
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      {% endif %}
    </div>
    
    <style>
      @keyframes pulse-ring {
        0% {
          transform: translate(-50%, -50%) scale(0.8);
          opacity: 0.5;
        }
        100% {
          transform: translate(-50%, -50%) scale(1.5);
          opacity: 0;
        }
      }
    </style>
  `, {
    build: function() {
      this.constructor.superclass.build.call(this);
      const container = this.getParentElement().getElementsByClassName('sos-marker-container')[0];
      if (container) {
        container.addEventListener('click', () => {
          const data = this.getData();
          if (data && data.properties && data.properties.onClick) {
            data.properties.onClick();
          }
        });
      }
    }
  });
};

export const createSOSPlacemark = (
  ymaps: any,
  position: [number, number],
  avatarUrl: string | null,
  initials: string,
  hasResponder: boolean,
  onClick: () => void,
  CustomLayout: any
) => {
  const placemark = new ymaps.Placemark(
    position,
    {
      avatarUrl: avatarUrl || '',
      initials,
      hasResponder,
      onClick,
    },
    {
      iconLayout: CustomLayout,
      iconShape: {
        type: 'Circle',
        coordinates: [30, 30],
        radius: 40,
      },
    }
  );

  return placemark;
};
