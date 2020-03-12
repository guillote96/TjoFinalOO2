import Archivo from './archivo';
class Wav extends Archivo {
    constructor(main) {
		super();
		super.inicializar(this.generateWavFile(main),"my_waveform.wav",{type: "audio/wav"});
	
        
    }

    generateWavFile(main) {

		var WavBundle = function(trackLength,main) {
			this.trackLength = trackLength; // in seconds.
			this.channels = 1; // Standard mono-audio
			this.sampleRate = 44100; //Hz (44100 is pretty universal)
			this.bitDepth = 8; // Low-fi...
			this.bitRate = this.channels * this.sampleRate * this.bitDepth;
			this.sampleSize = (this.bitDepth * this.channels) / (8); //bytes
			this.nSamples = this.sampleRate * this.trackLength;
			this.totalSize = (this.nSamples * this.sampleSize) + 44;
			this.buffer = new Int8Array(this.totalSize);

			/**
			 * generateWaveHeader makes a new this.buffer with a header
			 *  for the WAV file in the standard format.
			 *
			 *  see: http://www.topherlee.com/software/pcm-tut-wavformat.html
			 *   for a reference about what the header should contain.
			 **/
			this.generateWavHeader = function() {
				this.buffer[0]  = 0x52; //R
				this.buffer[1]  = 0x49; //I
				this.buffer[2]  = 0x46; //F
				this.buffer[3]  = 0x46; //F

				// This block records the total file size
				this.buffer[4]  = (0x000000ff & this.totalSize);
				this.buffer[5]  = (0x0000ff00 & this.totalSize) >>  8;
				this.buffer[6]  = (0x00ff0000 & this.totalSize) >> 16;
				this.buffer[7]  = (0xff000000 & this.totalSize) >> 24;

				this.buffer[8]  = 0x57; //W
				this.buffer[9]  = 0x41; //A
				this.buffer[10] = 0x56; //V
				this.buffer[11] = 0x45; //E

				this.buffer[12] = 0x66; //f
				this.buffer[13] = 0x6d; //m
				this.buffer[14] = 0x74; //t
				this.buffer[15] = 0x20; //

				this.buffer[16] = 0x10; // This block sets the length of
				this.buffer[17] = 0x00; //  the "format chunk" to 16
				this.buffer[18] = 0x00;
				this.buffer[19] = 0x00;

				this.buffer[20] = 0x01; // Type of format (1 is PCM) - 2 byte integer
				this.buffer[21] = 0x00;

				// This block sets the number of channels
				this.buffer[22] = (0x00ff & this.channels);
				this.buffer[23] = (0xff00 & this.channels) >> 8;

				// This block sets the sample rate
				this.buffer[24] = (0x000000ff & this.sampleRate);
				this.buffer[25] = (0x0000ff00 & this.sampleRate) >>  8;
				this.buffer[26] = (0x00ff0000 & this.sampleRate) >> 16;
				this.buffer[27] = (0xff000000 & this.sampleRate) >> 24;

				// Now to set the bitRate
				this.buffer[28] = (0x000000ff & this.bitRate);
				this.buffer[29] = (0x0000ff00 & this.bitRate) >>  8;
				this.buffer[30] = (0x00ff0000 & this.bitRate) >> 16;
				this.buffer[31] = (0xff000000 & this.bitRate) >> 24;

				// Set block align equal to 4
				this.buffer[32] = 0x04;
				this.buffer[33] = 0x00;

				// This block sets the number of bits per sample
				this.buffer[34] = (0x00ff & this.bitDepth);
				this.buffer[35] = (0xff00 & this.bitDepth) >> 8;

				this.buffer[36] =  0x64; //d
				this.buffer[37] =  0x61; //a
				this.buffer[38] =  0x74; //t
				this.buffer[39] =  0x61; //a

				// Size of the "data" section
				var dSize = (this.nSamples * this.sampleSize); // too long!
				this.buffer[40] =  (0x000000ff & dSize);
				this.buffer[41] =  (0x0000ff00 & dSize) >>  8;
				this.buffer[42] =  (0x00ff0000 & dSize) >> 16;
				this.buffer[43] =  (0xff000000 & dSize) >> 24;
            }

            var getCurrentFrequency = function(t, freqData) {

                // First find the frequency at time t...
                var frequency = 0;
            
                for (var j=0; j<freqData.length; j++) {
            
                    if ((t <= freqData[0].t) && (j == 0)) {
                        frequency = freqData[j].value;
            
                    } else if ((t < freqData[j].t) && (t >= freqData[j-1].t)) {
                        var df = freqData[j].value - freqData[j-1].value;
                        var dt = freqData[j].t - freqData[j-1].t;
                        frequency = freqData[j-1].value + ((t - freqData[j-1].t)*(df/dt));
            
                    } else {
                        frequency = freqData[j].value;
                    }
            
                }
            
                return frequency;
            
            }

            var getCurrentAmplitude = function(t, ampData) {

                var amp = 0.1; // default
                for (var j=0; j<ampData.length; j++) {
           
                    // Case 1: t is less than first keyframe
                    if ((j==0) && (t <= ampData[j].t)) {
                        amp = ampData[j].value;
                    }
           
                    // Case 2: t is between two keyframes
                    else if ((t < ampData[j].t) && (t > ampData[j-1].t)) {
                        var rise = ampData[j].value - ampData[j-1].value;
                        var run  = ampData[j].t - ampData[j-1].t;
                        var slope = rise/run;
                        amp = (slope * (t - ampData[j-1].t)) + ampData[j-1].value;
                    }
           
                    // Case 3: t is beyond final keyframe
                    else if ((j == (ampData.length-1)) && (t > ampData[j].t)) {
                        amp = ampData[j].value;
                    }
                } // End of the amplitude search
                return amp;
            }


            var getCurrentFT = function(t, freqData) {

                var ft = 0; // default
            
                for (var j=0; j<freqData.length; j++) {
            
                    // Case 1: t is before the first keyframes
                    if ((t <= freqData[0].t) && (j==0)) {
                        ft = freqData[0].value * (t/1000);
                    }
            
                    // Case 2: t is between two keyframes
                    else if ((t < freqData[j].t) && (t >= freqData[j-1].t)) {
            
                        var dfTotal = freqData[j].value - freqData[j-1].value;
                        var dtTotal = freqData[j].t - freqData[j-1].t;
                        var slope = dfTotal/dtTotal;
                        var dt = t - freqData[j-1].t;
                        var df = slope * dt;
                        var intP1 = (dt/1000) * freqData[j-1].value;
                        var intP2 = (dt/1000) * df * 0.5;
                        var ft = intP1 + intP2;
                    }
            
                    // Case 3: t is beyond the last keyframe
                    else if ((j == (freqData.length-1)) && (t > freqData[j].t)) {
                         ft = freqData[j].value * (t/1000);
                     }
            
                } // End of the frequency calculations
            
                var previousFT = 0;
            
                for (var j=0; j<freqData.length; j++) {
            
                    if (j == 0) {
                        previousFT += freqData[0].t * freqData[0].value;
                    }
            
                    else if (t >= freqData[j].t) {
                        break;
                    }
            
                    else {
                        var dt = freqData[j].t - freqData[j-1].t;
                        var freqSum = freqData[j].value + freqData[j-1].value;
                        previousFT += 0.5 * dt * freqSum;
                    }
            
            
                }
            
                return ft + previousFT;
            }
            
            




			/**
				* generateWavContent will generate the actual sound-producing
				*  portion of the WAV file.
				**/
			this.generateWavContent = function(main) {

				var iconStore = main;
				var ampParams = iconStore.parameters.amplitude.data;
				var freqParams = iconStore.parameters.frequency.data;

				var range = Math.pow(2, this.bitDepth - 1) - 2;
									// subtract 2 to avoid any clipping.

				// calculate the speaker displacement at each frame
				//  emulating a sinewave here...
				for (var i=0; i<=this.nSamples; i=(i+this.sampleSize)) {

					var t = ((i * 1000) / this.sampleRate);

					var amp = getCurrentAmplitude(t, ampParams);
					var ft = getCurrentFT(t, freqParams); // Integral of freq over t

					var vol = range * amp;
					//vol = equalize(t, freqParams, vol);
					var angle = Math.sin(2 * Math.PI * ft);
					var oscOffset = Math.round(vol * angle);

					if (oscOffset < 0) {
						oscOffset = ~(Math.abs(oscOffset));
					}

					// Range - Offset = WAV encoding of Offset... Weird!
					this.buffer[(i*this.sampleSize)+44] = range - oscOffset;
				}
			}
		} /**  End of WavBundle Constructor  **/


		/**
		 *  Heres where everything gets called in order to produce the WAV file
		 **/
		var duration = main.duration / 1000;

		var wavObj = new WavBundle(duration,main); // a 3 second long clip
		wavObj.generateWavHeader();
		wavObj.generateWavContent(main); // volume = 1, frequency = 350
		return wavObj.buffer;

	}
 
  }
  
  export default Wav;