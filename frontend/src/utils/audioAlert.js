export const playLoudChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const playTone = (frequency, type, startTime, duration, volume) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, startTime);
      
      gain.gain.setValueAtTime(volume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;

    // Ding-Dong Chime 1
    playTone(880, 'sine', now, 0.45, 0.9); // High bright pitch
    playTone(1109.73, 'sine', now, 0.45, 0.9);
    
    playTone(587.33, 'sine', now + 0.18, 0.6, 0.9); // Deep warm bell pitch
    playTone(739.99, 'sine', now + 0.18, 0.6, 0.9);

    // Ding-Dong Chime 2 (Shortly after)
    playTone(880, 'sine', now + 0.6, 0.45, 0.75);
    playTone(1109.73, 'sine', now + 0.6, 0.45, 0.75);
    
    playTone(587.33, 'sine', now + 0.78, 0.6, 0.75);
    playTone(739.99, 'sine', now + 0.78, 0.6, 0.75);

    // Triple alert chime for extra urgency (high pitch beep at the end)
    playTone(1318.51, 'sine', now + 1.3, 0.3, 0.8);
  } catch (error) {
    console.error('Audio alert synthesis failed:', error);
  }
};

export const showDesktopNotification = (order) => {
  if (!('Notification' in window)) return;

  const title = `🚨 New Order Received!`;
  const itemsText = order.items ? order.items.map(i => `${i.quantity}x ${i.name}`).join(', ') : 'Details inside';
  const options = {
    body: `Customer: ${order.customerName}\nTotal Amount: AED ${order.totalAmount.toFixed(2)}\nItems: ${itemsText}`,
    requireInteraction: true,
    tag: 'new-order-' + order._id
  };

  if (Notification.permission === 'granted') {
    new Notification(title, options);
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, options);
      }
    });
  }
};
