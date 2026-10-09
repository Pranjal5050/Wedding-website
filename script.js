const weddingDate = new Date("December 25, 2026 19:00:00").getTime();

function countdown(){

    const now = new Date().getTime();

    const difference = weddingDate - now;

    if(difference <= 0){
        document.getElementById("days").innerHTML = "00";
        document.getElementById("hours").innerHTML = "00";
        document.getElementById("minutes").innerHTML = "00";
        document.getElementById("seconds").innerHTML = "00";

        return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));

    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);

    const minutes = Math.floor((difference / (1000 * 60)) % 60);

    const seconds = Math.floor((difference / 1000) % 60);

    document.getElementById("days").innerHTML = days;
    document.getElementById("hours").innerHTML = hours;
    document.getElementById("minutes").innerHTML = minutes;
    document.getElementById("seconds").innerHTML = seconds;

}

countdown();

setInterval(countdown, 1000);

const songInput = document.getElementById("songInput");
const audio = document.getElementById("audio");

const playBtn = document.getElementById("playBtn");
const playIcon = document.getElementById("playIcon");

const songName = document.getElementById("songName");
const songArtist = document.getElementById("songArtist");
const songImage = document.getElementById("songImage");

const progress = document.getElementById("progress");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");

const volume = document.getElementById("volume");
const volumeIcon = document.getElementById("volumeIcon");
const uploadStatus = document.getElementById("uploadStatus");

let songUrl = null;

// Format seconds into mm:ss

function formatTime(time){
    if(!Number.isFinite(time)) return "0.00";

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, 0);
    return `${minutes}:${seconds}`;
}

//Update play/pause icon

function updatePlayButton(isPlaying){
    playIcon.className = isPlaying
    ? "ri-pause-fill text-2xl"
    : "ri-play-fill text-2xl";

    playBtn.setAttribute(
        "aria-lebel",
        isPlaying ? "Pause song": "Play song"
    )
}

// Browse and select a local audio file

songInput.addEventListener("change", function(){
    const file = this.files[0];

    if(!file) return;

    if(!file.type.startsWith("audio/")){
        uploadStatus.textContent = "please select a valid audio file.";
        this.value = "";
        return;
    }

    //Release the previous local URL

    if(songUrl){
        URL.revokeObjectURL(songUrl);
    }

    audio.pause();
    updatePlayButton(false);

    songUrl = URL.createObjectURL(file);
    audio.src = songUrl;
    audio.load();

    songName.textContent = file.name.replace(/\/[^/.]+$/, "");
    songArtist.textContent = "Your selected song";

    //Reset thumbnail

    songImage.innerHTML = '<i class="ri-music-2-line text-2xl text-[#80654b]"></i>';

    progress.value = 0;
    currentTime.textContent = "0:00";
    duration.textContent = "0:00";

    playBtn.disabled = false;
    uploadStatus.textContent = "song selected successfully";

    //Allow selecting the same file again

    this.value = "";
});

//Play / Pause

playBtn.addEventListener("click", async function(){
    if(!audio.src) return;

    if(audio.pause){
        try{
            await audio.play();
            uploadStatus.textContent = "";
        } catch(error){
            uploadStatus.textContent = "Unable to play this file. Please select another song";
            updatePlayButton(false);
        }
    } else{
        audio.pause();
    }
})

audio.addEventListener("play", ()=>{
    updatePlayButton(true);
});

audio.addEventListener("pause", ()=>{
    updatePlayButton(false);
});

//Duration

audio.addEventListener("loadedmetadata", ()=>{
    duration.textContent = formatTime(audio.duration);
})

// Live progress and current time
audio.addEventListener("timeupdate", ()=>{
    if(!Number.isFinite(audio.duration) || audio.duration <= 0) return;

    progress.value = (audio.currentTime / audio.duration) * 100;
    currentTime.textContent = formatTime(audio.currentTime);
})

//Seek

progress.addEventListener("input", ()=>{
    if(!Number.isFinite(audio.duration) || audio.duration <= 0) return;
    audio.currentTime = (Number(progress.value) / 100) * audio.duration;
})

//Volume

volume.addEventListener("input", ()=>{
    audio.volume = Number(volume.value);

    volumeIcon.className = 
    audio.volume === 0
    ? "ri-volume-mute-line text-xl text-[#80654b]"
    : audio.volume < 0.5
    ? "ri-volume-down-line text-xl text-[#80654b]"
    : "ri-volume-up-line text-xl text-[#80654b]"
});

//Reset when song ends

audio.addEventListener("ended", ()=>{
    updatePlayButton(false);
    progress.value = 0;
    currentTime.textContent = "0:00";
});

//Audio loading error

audio.addEventListener("error", ()=>{
    if(audio.src){
        uploadStatus.textContent = 
        "This audio file could not be loaded. Try another file.";
        updatePlayButton(false);
    }
})