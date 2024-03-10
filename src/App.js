import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faVolumeUp, faVolumeDown, faVolumeOff, faStepForward, faStepBackward, faExpand, faCompress, faTachometerAlt } from '@fortawesome/free-solid-svg-icons';
import './App.css';

const VideoPlayer = ({ video, onVideoEnd }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const videoRef = useRef();

  useEffect(() => {
    if (video) {
      const savedTime = parseFloat(localStorage.getItem(`${video.title}_time`));
      if (!isNaN(savedTime)) {
        videoRef.current.currentTime = savedTime;
      }
      setIsPlaying(true);
      videoRef.current.play();
    }
  }, [video]);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(document.fullscreenElement !== null);
    };
  
    document.addEventListener('fullscreenchange', handleFullScreenChange);
  
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);
  

  useEffect(() => {
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const video = videoRef.current;
    if (video) {
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      return () => {
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
      };
    }
  }, [videoRef.current]);
  

  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(error => console.error("Error playing video:", error));
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };
  
  const handleSeek = (event) => {
    const seekTime = parseFloat(event.target.value);
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleSpeedChange = (event) => {
    const selectedSpeed = parseFloat(event.target.value);
    setSpeed(selectedSpeed);
    videoRef.current.playbackRate = selectedSpeed;
  };

  const handleVolumeChange = (event) => {
    const selectedVolume = parseFloat(event.target.value);
    setVolume(selectedVolume);
    videoRef.current.volume = selectedVolume;
  };

  const handleFullScreenToggle = () => {
    if (!isFullScreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.mozRequestFullScreen) { 
        videoRef.current.mozRequestFullScreen();
      } else if (videoRef.current.webkitRequestFullscreen) { 
        videoRef.current.webkitRequestFullscreen();
      } else if (videoRef.current.msRequestFullscreen) { 
        videoRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) { 
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) { 
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { 
        document.msExitFullscreen();
      }
    }
    setIsFullScreen(!isFullScreen);
  };

  const handleVideoEnd = () => {
    localStorage.setItem(`${video.title}_time`, '0');
    onVideoEnd();
  };

  return (
    <>
      {video && (
        <div className={`video-player-container ${isFullScreen ? 'fullscreen' : ''}`}>
          <video
            ref={videoRef}
            src={video.src}
            onTimeUpdate={() => {
              setCurrentTime(videoRef.current.currentTime);
              localStorage.setItem(`${video.title}_time`, videoRef.current.currentTime);
            }}
            onLoadedMetadata={() => setDuration(videoRef.current.duration)}
            autoPlay
            onEnded={handleVideoEnd}
          ></video>

            <div className={`controls ${isFullScreen ? 'hidden' : ''}`}>
            <button onClick={togglePlay} className="control-button">
              <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
            </button>
            <input
              type="range"
              value={currentTime}
              min={0}
              max={duration}
              onChange={handleSeek}
              className="seek-bar"
            />
            <span className="time">
              {`${formatTime(currentTime)} / ${formatTime(duration)}`}
            </span>
            <select value={speed} onChange={handleSpeedChange} className="speed-selector">
              <option value={1}>Normal</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
            <div className="volume-control">
              <FontAwesomeIcon icon={volume > 0 ? (volume >= 0.5 ? faVolumeUp : faVolumeDown) : faVolumeOff} />
              <input
                type="range"
                value={volume}
                min={0}
                max={1}
                step={0.1}
                onChange={handleVolumeChange}
                className="volume-slider"
              />
            </div>
            <button onClick={handleFullScreenToggle} className="control-button">
              <FontAwesomeIcon icon={isFullScreen ? faCompress : faExpand} />
            </button>
          </div>
        </div>
      )}
      {!video && <div>No video selected</div>}
    </>
  );
};

const Playlist = ({ videos, onVideoClick, currentVideoIndex }) => {
  return (
    <div className="playlist">
      <h2>Playlist</h2>
      {videos.map((video, index) => (
        <div key={index} className={`playlist-item ${index === currentVideoIndex ? 'selected' : ''}`} onClick={() => onVideoClick(video, index)}>
          <div className="video-preview">
            <video src={video.src} className="preview-video" controls /> 
          </div>
          <div className="video-info">
            <span className="video-title">{video.title}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const App = () => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(null);

  const handleVideoEnd = () => {
    if (currentVideoIndex !== null && currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else {
      setCurrentVideoIndex(0);
    }
  };

  const handleVideoClick = (video, index) => {
    setCurrentVideoIndex(index);
  };

  const videos = [
    { src: 'https://www.w3schools.com/html/mov_bbb.mp4', title: 'Big Buck Bunny' },
    { src: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4', title: 'Sample MP4 Video' },
  // { src: 'https://www.w3schools.com/html/mov_bbb.mp4', title: 'Big Buck Bunny' },
    { src: 'https://www.w3schools.com/html/movie.mp4', title: 'Bear MP4 Video' },
  ];

  return (
    <div className="app">
      <div className="card">
        {currentVideoIndex !== null ? (
          <VideoPlayer video={videos[currentVideoIndex]} onVideoEnd={handleVideoEnd} />
        ) : (
          <div className="select-video-message">Select a video from the playlist to play</div>
        )}
        <div className="playlist-container">
          <Playlist videos={videos} onVideoClick={handleVideoClick} currentVideoIndex={currentVideoIndex} />
        </div>
      </div>
    </div>
  );
};


const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export default App;
