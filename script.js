// --- Core LSB helpers -------------------------------------------------

function textToBits(str) {
  const bits = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    for (let b = 7; b >= 0; b--) bits.push((code >> b) & 1);
  }
  // 16-bit terminator-free length header is added by caller; here we just
  // append a null character as an end marker for simplicity.
  return bits;
}

function encodeMessageIntoImageData(imageData, message) {
  const bits = textToBits(message + '\0');
  const data = imageData.data;
  const capacityBits = Math.floor((data.length / 4) * 3);
  if (bits.length > capacityBits) {
    throw new Error('Message too long for this image.');
  }

  let bi = 0;
  let lastEncodedPixel = -1;

  // Encode message bits into LSB of R,G,B channels
  for (let i = 0; i < data.length && bi < bits.length; i += 4) {
    data[i] = (data[i] & 0xFE) | bits[bi++];
    if (bi < bits.length) data[i + 1] = (data[i + 1] & 0xFE) | bits[bi++];
    if (bi < bits.length) data[i + 2] = (data[i + 2] & 0xFE) | bits[bi++];
    lastEncodedPixel = i;
  }

  // Clear LSB of *remaining* pixels only (after the last encoded pixel)
  if (lastEncodedPixel >= 0) {
    for (let i = lastEncodedPixel + 4; i < data.length; i += 4) {
      data[i] = data[i] & 0xFE;
      data[i + 1] = data[i + 1] & 0xFE;
      data[i + 2] = data[i + 2] & 0xFE;
    }
  }

  return imageData;
}

function decodeMessageFromImageData(imageData) {
  const data = imageData.data;
  const bits = [];
  for (let i = 0; i < data.length; i += 4) {
    bits.push(data[i] & 1);
    bits.push(data[i + 1] & 1);
    bits.push(data[i + 2] & 1);
  }
  let msg = '';
  for (let i = 0; i + 7 < bits.length; i += 8) {
    let code = 0;
    for (let b = 0; b < 8; b++) code = (code << 1) | bits[i + b];
    if (code === 0) break;
    msg += String.fromCharCode(code);
  }
  return msg;
}

function capacityForImage(width, height) {
  // 3 usable bits per pixel (R,G,B), 8 bits per character
  return Math.floor((width * height * 3) / 8);
}

// --- Shared UI wiring ---------------------------------------------------

function setupDropzone(dropzoneEl, inputEl, onFile) {
  dropzoneEl.addEventListener('click', () => inputEl.click());
  inputEl.addEventListener('change', () => {
    if (inputEl.files && inputEl.files[0]) onFile(inputEl.files[0]);
  });
  ['dragover', 'dragenter'].forEach(evt =>
    dropzoneEl.addEventListener(evt, e => {
      e.preventDefault();
      dropzoneEl.classList.add('dragover');
    })
  );
  ['dragleave', 'drop'].forEach(evt =>
    dropzoneEl.addEventListener(evt, e => {
      e.preventDefault();
      dropzoneEl.classList.remove('dragover');
    })
  );
  dropzoneEl.addEventListener('drop', e => {
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) onFile(file);
  });
}

function loadImageFile(file, callback) {
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => callback(img, file);
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
