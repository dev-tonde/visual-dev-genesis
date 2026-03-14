import { useState, useEffect } from 'react';

const DynamicGreeting = () => {
  const [greeting, setGreeting] = useState('Hello');

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();

      if (hour >= 5 && hour < 12) {
        setGreeting('Good morning');
      } else if (hour >= 12 && hour < 17) {
        setGreeting('Good afternoon');
      } else if (hour >= 17 && hour < 22) {
        setGreeting('Good evening');
      } else {
        setGreeting('Hello');
      }
    };

    updateGreeting();

    // Update greeting every minute
    const interval = setInterval(updateGreeting, 60000);

    return () => clearInterval(interval);
  }, []);

  return <span>{greeting}</span>;
};

export default DynamicGreeting;
