import fs from 'fs';
import path from 'path';

// Generate realistic synthetic dataset based on research proxy models
export function generateSyntheticDataset(count = 1200) {
  const records = [];

  // Helper for Gaussian/Normal distribution via Box-Muller transform
  function randomGaussian(mean, stdev) {
    let u = 1 - Math.random();
    let v = Math.random();
    let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + z * stdev;
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  // Distribution splits: ~35% LOW, ~35% MEDIUM, ~30% HIGH
  for (let i = 1; i <= count; i++) {
    let targetClass;
    const r = Math.random();
    if (r < 0.35) {
      targetClass = 'LOW';
    } else if (r < 0.70) {
      targetClass = 'MEDIUM';
    } else {
      targetClass = 'HIGH';
    }

    let time_per_page;
    let scroll_speed;
    let number_of_re_reads;
    let backtracking_count;
    let quiz_hesitation_time;
    let quiz_attempts;
    let quiz_accuracy;
    let session_duration;

    if (targetClass === 'LOW') {
      // Comfortable learner: fast comprehension, smooth scrolling, low hesitation, high accuracy
      time_per_page = clamp(randomGaussian(65, 20), 20, 150);
      scroll_speed = clamp(randomGaussian(380, 70), 180, 650);
      number_of_re_reads = Math.floor(clamp(randomGaussian(0.8, 0.9), 0, 3));
      backtracking_count = Math.floor(clamp(randomGaussian(0.5, 0.7), 0, 2));
      quiz_hesitation_time = clamp(randomGaussian(6.5, 3), 1.5, 18);
      quiz_attempts = Math.floor(clamp(randomGaussian(1.1, 0.3), 1, 2));
      quiz_accuracy = clamp(randomGaussian(92, 7), 75, 100);
      session_duration = clamp(randomGaussian(400, 150), 100, 1200);
    } else if (targetClass === 'MEDIUM') {
      // Moderate cognitive load: moderate dwell time, occasional re-reading, moderate hesitation
      time_per_page = clamp(randomGaussian(140, 35), 70, 240);
      scroll_speed = clamp(randomGaussian(210, 50), 100, 350);
      number_of_re_reads = Math.floor(clamp(randomGaussian(2.6, 1.2), 1, 5));
      backtracking_count = Math.floor(clamp(randomGaussian(1.8, 1.0), 0, 4));
      quiz_hesitation_time = clamp(randomGaussian(18, 6), 7, 35);
      quiz_attempts = Math.floor(clamp(randomGaussian(1.9, 0.7), 1, 4));
      quiz_accuracy = clamp(randomGaussian(72, 11), 45, 90);
      session_duration = clamp(randomGaussian(750, 200), 250, 1800);
    } else {
      // HIGH cognitive load (Struggling): high dwell time, slow scrolling, frequent re-reads and backtracks, long hesitation, lower accuracy
      time_per_page = clamp(randomGaussian(260, 60), 140, 480);
      scroll_speed = clamp(randomGaussian(95, 30), 25, 180);
      number_of_re_reads = Math.floor(clamp(randomGaussian(5.2, 1.8), 3, 11));
      backtracking_count = Math.floor(clamp(randomGaussian(4.1, 1.6), 2, 8));
      quiz_hesitation_time = clamp(randomGaussian(38, 12), 18, 75);
      quiz_attempts = Math.floor(clamp(randomGaussian(3.2, 1.1), 2, 6));
      quiz_accuracy = clamp(randomGaussian(42, 14), 10, 68);
      session_duration = clamp(randomGaussian(1200, 350), 500, 2800);
    }

    // Add realistic 5% label noise to simulate human variance and realistic ML testing
    let finalLabel = targetClass;
    if (Math.random() < 0.05) {
      const otherClasses = targetClass === 'LOW' 
        ? ['MEDIUM'] 
        : targetClass === 'MEDIUM' 
          ? ['LOW', 'HIGH'] 
          : ['MEDIUM'];
      finalLabel = otherClasses[Math.floor(Math.random() * otherClasses.length)];
    }

    records.push({
      id: i,
      time_per_page: Math.round(time_per_page * 10) / 10,
      scroll_speed: Math.round(scroll_speed * 10) / 10,
      number_of_re_reads,
      backtracking_count,
      quiz_hesitation_time: Math.round(quiz_hesitation_time * 10) / 10,
      quiz_attempts,
      quiz_accuracy: Math.round(quiz_accuracy * 10) / 10,
      session_duration: Math.round(session_duration),
      cognitive_load: finalLabel,
    });
  }

  return records;
}

export function saveDatasetToCSV(records, filePath) {
  const targetPath = filePath || path.join(process.cwd(), 'data', 'cognitive_load_dataset.csv');
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const headers = [
    'time_per_page',
    'scroll_speed',
    'number_of_re_reads',
    'backtracking_count',
    'quiz_hesitation_time',
    'quiz_attempts',
    'quiz_accuracy',
    'session_duration',
    'cognitive_load'
  ];

  const rows = records.map(r => [
    r.time_per_page,
    r.scroll_speed,
    r.number_of_re_reads,
    r.backtracking_count,
    r.quiz_hesitation_time,
    r.quiz_attempts,
    r.quiz_accuracy,
    r.session_duration,
    r.cognitive_load
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\n');
  fs.writeFileSync(targetPath, csvContent, 'utf-8');
  return targetPath;
}
