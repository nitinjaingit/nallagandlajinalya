window.getEventImages = (event) => {
  if (Array.isArray(event?.images)) return event.images;

  const sequence = event?.images;
  const start = Number(sequence?.start);
  const end = Number(sequence?.end);
  if (!Number.isInteger(start) || !Number.isInteger(end) || end < start) return [];

  const baseUrl = String(event.imageBaseUrlEvent || "").replace(/\/$/, "");
  if (!baseUrl || !event.id) return [];

  const extension = String(sequence.extension || "jpeg").replace(/^\./, "");
  const padding = Number(sequence.padding) || 0;
  return Array.from({length: end - start + 1}, (_, index) => {
    const imageNumber = start + index;
    const fileNumber = String(imageNumber).padStart(padding, "0");
    return {
      src: `${baseUrl}/${event.id}/${fileNumber}.${extension}`,
      alt: `${event.title} photo ${imageNumber}`
    };
  });
};