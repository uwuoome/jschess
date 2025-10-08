import { useState, useEffect } from 'react';
import myMove from '../assets/sounds/move-self.mp3';
import opMove from '../assets/sounds/move-opponent.mp3';
import capture from '../assets/sounds/capture.mp3';
import check from '../assets/sounds/check.mp3';
import notify from '../assets/sounds/notify.mp3';
import promote from '../assets/sounds/promote.mp3';


const soundMap: Record<string, string> = {
  myMove,
  opMove,
  capture,
  check,
  notify,
  promote,
};

export type SoundType = {
	play: () => void;
	audio: HTMLAudioElement | null;
}

/**
 * Custom hook to manage and play sound effects.
 * @param {string} soundName - The key of the sound to play.
 */
const useSound = (soundName: string): SoundType => {
	if(soundMap[soundName] == null){
		soundName = "myMove";
	}
	const soundPath = soundMap[soundName];
	const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

	useEffect(() => {
		if(soundPath){
			const audioObject = new Audio(soundPath);
			// Preload the sound for immediate playback
			audioObject.preload = 'auto'; 
			setAudio(audioObject);
			return () => {
				if(! audio) return;
				audioObject?.pause();
				setAudio(null);
			};
		}
		return () => {};
	}, [soundPath]); // Re-run only if the soundPath changes

	const play = () => {
		if(! audio) return;
		if(audio.readyState < 3) return; 
		audio.currentTime = 0;
		audio.play().catch(error => {
			console.error("Audio playback failed:", error);
		});
	}

	return { play, audio };
};

export default useSound;