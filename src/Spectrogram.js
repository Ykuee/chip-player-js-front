import autoBind from 'auto-bind';
import chroma from 'chroma-js';

const MODE_LINEAR = 0;
const MODE_LOG = 1;
const MODE_CONSTANT_Q = 2;

const WEIGHTING_NONE = 0;
const WEIGHTING_A = 1;
const colorMap = new chroma.scale([
  'rgba(57,197,187,0.79)',
  'rgba(47,20,232,0.73)',
  'rgba(73,166,20,0.45)',
  'rgba(28,182,11,0.66)',
  'rgba(218,103,19,0.62)',
  'rgba(211,124,173,0.59)',
  'rgba(255,255,160,0.22)',
  'rgba(255,255,255,0.2)',
]).domain([0, 255]);
const _debug = window.location.search.indexOf('debug=true') !== -1;
let _aWeightingLUT;
let _calcTime = 0;
let _totalTime = 0;
let _timeCount = 0;
let _lastTime = 0;

function _getAWeighting(f) {
  var f2 = f * f;
  return 1.5 * 1.2588966 * 148840000 * f2 * f2 /
      ((f2 + 424.36) * Math.sqrt((f2 + 11599.29) * (f2 + 544496.41)) * (f2 + 148840000));
}

export default class Spectrogram {
  constructor(chipCore, audioCtx, sourceNode, freqCanvas, specCanvas, pianoKeysImage, minDb = -90, maxDb = -30) {
    autoBind(this);

    // Constant Q setup
    this.core = chipCore;
    const db = 32;
    const supersample = 0;
    const cqtBins = freqCanvas.width;
    const fMin = 25.95;
    const fMax = 4504.0;
    const cqtSize = this.core._cqt_init(audioCtx.sampleRate, cqtBins, db, fMin, fMax, supersample);
    if (!cqtSize) {
      console.error('Error initializing constant Q transform. Constant Q will be disabled.');
    } else {
      this.cqtFreqs = Array(cqtBins).fill().map((_, i) => this.core._cqt_bin_to_freq(i));
      _aWeightingLUT = this.cqtFreqs.map(f => 0.5 + 0.5 * _getAWeighting(f));
    }
    this.cqtSize = cqtSize;
    this.dataPtr = this.core._malloc(cqtSize * 4);

    this.paused = true;
    this.mode = MODE_LINEAR;
    this.weighting = WEIGHTING_NONE;

    this.analyserNode = audioCtx.createAnalyser();
    sourceNode.connect(this.analyserNode);

    this.analyserNode.minDecibels = minDb;
    this.analyserNode.maxDecibels = maxDb;
    this.analyserNode.smoothingTimeConstant = 0.0;
    this.analyserNode.fftSize = this.fftSize = 2048;

    this.byteFrequencyData = new Uint8Array(this.analyserNode.frequencyBinCount);

    this.freqCanvas = freqCanvas;
    this.specCanvas = specCanvas;
    this.tempCanvas = document.createElement('canvas');
    this.tempCanvas.width = this.specCanvas.width;
    this.tempCanvas.height = this.specCanvas.height;

    // 启用透明背景
    this.freqCtx = this.freqCanvas.getContext('2d', { alpha: true });
    this.specCtx = this.specCanvas.getContext('2d', { alpha: true });
    this.tempCtx = this.tempCanvas.getContext('2d', { alpha: true });

    this.pianoKeysImage = pianoKeysImage;
    this.lastData = [];

    this.updateFrame();
  }

  setPaused(paused) {
    if (this.paused && !paused) {
      requestAnimationFrame(this.updateFrame);
    }
    this.paused = paused;
  }

  setMode(mode) {
    this.mode = mode;
    if (mode === MODE_CONSTANT_Q) {
      this.analyserNode.fftSize = this.cqtSize || 2048;
    } else {
      this.analyserNode.fftSize = this.fftSize;
    }
  }

  setFFTSize(size) {
    this.fftSize = size;
    this.analyserNode.fftSize = size;
  }

  isRepeatedFrequencyData(data) {
    let isRepeated = true;
    for (let bin = 0; bin < 40; bin += 2) {
      if (data[bin] !== this.lastData[bin]) {
        isRepeated = false;
      }
      this.lastData[bin] = data[bin];
    }
    return isRepeated;
  }

  setWeighting(mode) {
    this.weighting = mode;
  }

  setSpeed(speed) {
    this.specSpeed = speed;
  }

  updateFrame() {
    if (this.paused) return;
    requestAnimationFrame(this.updateFrame);

    const fqHeight = this.freqCanvas.height;
    const canvasWidth = this.freqCanvas.width;
    const hCoeff = fqHeight / 256.0;
    const specSpeed = this.specSpeed;
    const data = this.byteFrequencyData;
    const analyserNode = this.analyserNode;
    const freqCtx = this.freqCtx;
    const tempCtx = this.tempCtx;
    freqCtx.fillStyle = '#39c5bb';
    freqCtx.fillRect(0, 0, this.freqCanvas.width, this.freqCanvas.height);
    tempCtx.fillStyle = '#39c5bb';
    tempCtx.fillRect(0, 0, this.tempCanvas.width, specSpeed);
    const _start = performance.now();
    const dataHeap = new Float32Array(this.core.HEAPF32.buffer, this.dataPtr, this.cqtSize);
    const bins = this.fftSize / 2;
    let isRepeated = false;

    if (this.mode === MODE_LINEAR) {
      analyserNode.getByteFrequencyData(data);
      isRepeated = this.isRepeatedFrequencyData(data);
      for (let x = 0; x < bins && x < canvasWidth; ++x) {
        const style = colorMap(data[x]).hex();
        const h = data[x] * hCoeff | 0;
        freqCtx.fillStyle = style;
        freqCtx.fillRect(x, fqHeight - h, 1, h);
        tempCtx.fillStyle = style;
        tempCtx.fillRect(x, 0, 1, specSpeed);
      }
    } else if (this.mode === MODE_LOG) {
      analyserNode.getByteFrequencyData(data);
      isRepeated = this.isRepeatedFrequencyData(data);
      const logmax = Math.log(bins);
      for (let i = 0; i < bins; i++) {
        const x = (Math.log(i + 1) / logmax) * canvasWidth | 0;
        const binWidth = (Math.log(i + 2) / logmax) * canvasWidth - x | 0;
        const h = (data[i] * hCoeff) | 0;
        const style = colorMap(data[i] || 0).hex();
        freqCtx.fillStyle = style;
        freqCtx.fillRect(x, fqHeight - h, binWidth, h);
        tempCtx.fillStyle = style;
        tempCtx.fillRect(x, 0, binWidth, specSpeed);
      }
    } else if (this.mode === MODE_CONSTANT_Q) {
      analyserNode.getFloatTimeDomainData(dataHeap);
      if (!dataHeap.every(n => n === 0)) {
        this.core._cqt_calc(this.dataPtr, this.dataPtr);
        this.core._cqt_render_line(this.dataPtr);
        for (let x = 0; x < canvasWidth; x++) {
          const weighting = this.weighting === WEIGHTING_A ? _aWeightingLUT[x] : 1;
          const val = 255 * weighting * dataHeap[x] | 0; //this.core.getValue(this.cqtOutput + x * 4, 'float') | 0;
          const h = val * hCoeff | 0;
          const style = colorMap(val).hex();
          freqCtx.fillStyle = style;
          freqCtx.fillRect(x, fqHeight - h, 1, h);
          tempCtx.fillStyle = style;
          tempCtx.fillRect(x, 0, 1, specSpeed);
        }
      }
    }

    const _middle = performance.now();

    if (!isRepeated) {
      tempCtx.translate(0, specSpeed);
      tempCtx.drawImage(this.tempCanvas, 0, 0);
      tempCtx.setTransform(1, 0, 0, 1, 0, 0);

      this.specCtx.drawImage(this.tempCanvas, 0, 0);
    }

    const _end = performance.now();

    if (_debug) {
      _calcTime += _middle - _start;
      _totalTime += _end - _start;
      _timeCount++;
      if (_timeCount >= 200) {
        console.log(
            '[Viz] %s ms analysis, %s ms total (%s fps) (%s% utilization)',
            (_calcTime / _timeCount).toFixed(2),
            (_totalTime / _timeCount).toFixed(2),
            (1000 * _timeCount / (_start - _lastTime)).toFixed(1),
            (100 * _totalTime / (_end - _lastTime)).toFixed(1),
        );
        _calcTime = 0;
        _timeCount = 0;
        _totalTime = 0;
        _lastTime = _start;
      }
    }
  }
}

// getFloatTimeDomainData polyfill for Safari
if (global.AnalyserNode && !global.AnalyserNode.prototype.getFloatTimeDomainData) {
  var uint8 = new Uint8Array(32768);
  global.AnalyserNode.prototype.getFloatTimeDomainData = function(array) {
    this.getByteTimeDomainData(uint8);
    for (var i = 0, imax = array.length; i < imax; i++) {
      array[i] = (uint8[i] - 128) * 0.0078125;
    }
  };
}
