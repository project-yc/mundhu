export const formatDate = (value) => {
  if (!value) return '--';

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return '--';
  }

  return parsedDate.toLocaleDateString(undefined, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
};

export const formatSignedValue = (value, suffix = '') => {
  if (typeof value !== 'number') {
    return null;
  }

  if (value > 0) {
    return `+${value}${suffix}`;
  }

  return `${value}${suffix}`;
};

export const getSeverityColorClass = (severity) => {
  if (severity === 'HIGH') return 'bg-[#ff355e]';
  if (severity === 'MEDIUM') return 'bg-[#ffb020]';
  return 'bg-[#19d27c]';
};

export const getSessionStatusClass = (status) => {
  if (status === 'PASSED') {
    return 'bg-[#0f2a22] text-[#2fe18f] border border-[#1e6b4f]';
  }

  if (status === 'FAILED') {
    return 'bg-[#2a1118] text-[#ff5f7e] border border-[#6a2335]';
  }

  return 'bg-[#2a230f] text-[#ffce55] border border-[#6a5923]';
};

export const getStatusClass = (status) => {
  if (status === 'IMPROVING') {
    return 'text-[#2fe18f]';
  }

  if (status === 'DECLINING') {
    return 'text-[#ff5f7e]';
  }

  return 'text-[#8b9aba]';
};
