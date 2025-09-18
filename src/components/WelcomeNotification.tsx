"use client";
import { useEffect, useState } from 'react';

export default function WelcomeNotification() {
  const [show, setShow] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if notification was already shown in this session
    const hasShown = sessionStorage.getItem('welcome_notification_shown');
    if (hasShown) return;

    // Show notification after a brief delay
    const showTimer = setTimeout(() => {
      setVisible(true);
      setTimeout(() => setShow(true), 50); // Slight delay for animation
    }, 1000);

    // Hide notification after 7 seconds
    const hideTimer = setTimeout(() => {
      setShow(false);
      setTimeout(() => {
        setVisible(false);
        sessionStorage.setItem('welcome_notification_shown', 'true');
      }, 300); // Wait for slide out animation
    }, 8000); // 1s delay + 7s visible

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[9999] pointer-events-none">
      <div
        className={`transform transition-transform duration-300 ease-out ${
          show ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="mx-4 mt-4 pointer-events-auto">
          <div className="card p-4 bg-white shadow-2xl border border-border max-w-md mx-auto">
            <div className="text-sm text-gray-700 leading-relaxed text-center">
              Nach einem <strong>Einsatz</strong>: Klicke auf ein <strong>Event</strong> und lade deine{' '}
              <strong>Fotos</strong> hoch und fülle dein <strong>Reporting</strong> aus!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
