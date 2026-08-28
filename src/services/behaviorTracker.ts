import { useEffect, useRef, useState } from 'react';
import { BehavioralFeatures } from '../types';

export function useBehaviorTracker(topicId: string, isSimulated: boolean = false, simulatedOverrides?: Partial<BehavioralFeatures>) {
  const [features, setFeatures] = useState<BehavioralFeatures>({
    time_per_page: 75,
    scroll_speed: 320,
    number_of_re_reads: 0,
    backtracking_count: 0,
    quiz_hesitation_time: 8,
    quiz_attempts: 1,
    quiz_accuracy: 85,
    session_duration: 360
  });

  const startTimeRef = useRef<number>(Date.now());
  const lastScrollPosRef = useRef<number>(0);
  const lastScrollTimeRef = useRef<number>(Date.now());
  const maxScrollDepthRef = useRef<number>(0);
  const reReadCountRef = useRef<number>(0);
  const scrollSpeedsRef = useRef<number[]>([]);
  const prevTopicRef = useRef<string>(topicId);
  const backtrackingCountRef = useRef<number>(0);

  // When topic changes, increment backtracking if returning to a previous topic
  useEffect(() => {
    if (prevTopicRef.current !== topicId) {
      backtrackingCountRef.current += 1;
      prevTopicRef.current = topicId;
      startTimeRef.current = Date.now();
      maxScrollDepthRef.current = 0;
      reReadCountRef.current = 0;
    }
  }, [topicId]);

  // Real-time browser scroll & dwell tracking
  useEffect(() => {
    if (isSimulated) return;

    const handleScroll = () => {
      const now = Date.now();
      const currentScroll = window.scrollY;
      const timeDelta = (now - lastScrollTimeRef.current) / 1000;
      const distDelta = Math.abs(currentScroll - lastScrollPosRef.current);

      if (timeDelta > 0.05) {
        const speed = distDelta / timeDelta;
        scrollSpeedsRef.current.push(speed);
        if (scrollSpeedsRef.current.length > 20) scrollSpeedsRef.current.shift();
      }

      // Check if user scrolled back up by more than 250px below max depth (re-reading earlier paragraphs)
      if (currentScroll > maxScrollDepthRef.current) {
        maxScrollDepthRef.current = currentScroll;
      } else if (maxScrollDepthRef.current - currentScroll > 280) {
        reReadCountRef.current += 1;
        maxScrollDepthRef.current = currentScroll; // Reset marker
      }

      lastScrollPosRef.current = currentScroll;
      lastScrollTimeRef.current = now;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const interval = setInterval(() => {
      const dwellSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      const avgScrollSpeed = scrollSpeedsRef.current.length > 0
        ? Math.round(scrollSpeedsRef.current.reduce((a, b) => a + b, 0) / scrollSpeedsRef.current.length)
        : 280;

      setFeatures(prev => ({
        ...prev,
        time_per_page: dwellSeconds,
        scroll_speed: avgScrollSpeed,
        number_of_re_reads: reReadCountRef.current,
        backtracking_count: backtrackingCountRef.current,
        session_duration: prev.session_duration + 2,
        ...(simulatedOverrides || {})
      }));
    }, 2000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, [isSimulated, simulatedOverrides]);

  return {
    features: isSimulated && simulatedOverrides ? { ...features, ...simulatedOverrides } : features,
    setFeatures
  };
}
