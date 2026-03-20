export function formatDuration(seconds, totalDuration) {
  const mins = (totalDuration || 0) / 60;
  if (mins >= 60) {
    return mins >= 600
      ? new Date(seconds * 1000).toISOString().slice(11, 19)
      : new Date(seconds * 1000).toISOString().slice(12, 19);
  }
  return new Date(seconds * 1000).toISOString().slice(14, 19);
}
