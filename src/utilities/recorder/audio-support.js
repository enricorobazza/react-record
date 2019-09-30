export default class AudioSupport{

    constructor(numChannels, sampleRate){
        this.numChannels = numChannels;
        this.sampleRate = sampleRate;
    }

    floatTo16BitPCM(output, offset, input) {
        for (let i = 0; i < input.length; i++, offset += 2) {
          let s = Math.max(-1, Math.min(1, input[i]));
          output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
      }

      writeString(view, offset, string) {
        for (let i = 0; i < string.length; i += 1) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      }

      encodeWAV(samples) {
        const buffer = new ArrayBuffer(44 + (samples.length * 2));
        const view = new DataView(buffer);

        /* RIFF identifier */
        this.writeString(view, 0, 'RIFF');
        /* RIFF chunk length */
        view.setUint32(4, 36 + (samples.length * 2), true);
        /* RIFF type */
        this.writeString(view, 8, 'WAVE');
        /* format chunk identifier */
        this.writeString(view, 12, 'fmt ');
        /* format chunk length */
        view.setUint32(16, 16, true);
        /* sample format (raw) */
        view.setUint16(20, 1, true);
        /* channel count */
        view.setUint16(22, this.numChannels, true);
        /* sample rate */
        view.setUint32(24, this.sampleRate, true);
        /* byte rate (sample rate * block align) */
        view.setUint32(28, this.sampleRate * 4, true);
        /* block align (channel count * bytes per sample) */
        view.setUint16(32, this.numChannels * 2, true);
        /* bits per sample */
        view.setUint16(34, 16, true);
        /* data chunk identifier */
        this.writeString(view, 36, 'data');
        /* data chunk length */
        view.setUint32(40, samples.length * 2, true);

        this.floatTo16BitPCM(view, 44, samples);

        return view;
      }

      getBlob(array, type){
          let dataview = this.encodeWAV(array);
          return new Blob([dataview], {type:type});
      }
}