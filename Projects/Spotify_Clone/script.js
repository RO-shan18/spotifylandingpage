let currentsong = new Audio();
let currentfolder;
let songsname;

function secondsToMinutesSeconds(seconds) {
    if (typeof seconds !== 'number' || seconds < 0) {
        return "Invalid input";
    }
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = Math.floor(seconds % 60); // Ensure seconds are integer
    var formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    var formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
    return formattedMinutes + ':' + formattedSeconds;
}

async function song(folder){
    currentfolder = folder;
    let songs = await fetch(`http://127.0.0.1:3000/Projects/Spotify_Clone/${folder}`);
    let response = await songs.text();
    // console.log(response);    
    let div = document.createElement('div');
    div.innerHTML = response;

    let getsongs = div.getElementsByTagName('a');
    songsname = [];
    // console.log(getsongs)

    for (let index = 0; index < getsongs.length; index++) {
        const element = getsongs[index];
        if(element.href.endsWith(".mp3")){
            songsname.push(element.href.split(`${folder}`)[1]);
        }
    }

    let lib = document.querySelector(".library_lists").getElementsByTagName("ul")[0];
    lib.innerHTML=" ";
    for (const song of songsname) {
        lib.innerHTML = lib.innerHTML + `<li> <img src='svg_images/music.svg' alt=''>
        <div class='info'>
                  <div class='songname'>${song.replaceAll('%20', ' ').replace("/", "")}</div>
                  <div class='songartist'></div>
                </div>
                <img id="playimg" src='svg_images/play.svg' 
                alt=''></img>
                </li>`
    }

    // Attach an event listener
    Array.from(document.querySelector(".library_lists").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click", element=>{
            console.log(e.querySelector(".songname").innerHTML)
            playmusic(e.querySelector(".songname").innerHTML);
        })
    });
}

function playmusic(track, pause=false){
    currentsong.src = `${currentfolder}` + track;
        currentsong.play();
        playbtn.src = "svg_images/pause.svg"

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums(){
    let songs = await fetch(`http://127.0.0.1:3000/Projects/Spotify_Clone/songs`);
    let response = await songs.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let images = document.querySelector(".artist");
    let anchors = div.getElementsByTagName("a");
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if(e.href.includes("/songs/")){
            let folder = e.href.split("/")[6];
            let songs = await fetch(`http://127.0.0.1:3000/Projects/Spotify_Clone/songs/${folder}/info.json`);
            let response = await songs.json();
            images.innerHTML = images.innerHTML +  `<div data-folder="${folder}" class="images">
                <img src="svg_images/play.svg" alt="" srcset="" id="image1" />
                <img src="songs/${folder}/images.jpg" alt="" />
                <p>${response.title}</p>
            </div>` 
        }
    } 

    // Attach click event listeners to the newly created elements
    Array.from(document.getElementsByClassName("images")).forEach(e=>{
        e.addEventListener("click", async item=>{
            console.log(item.currentTarget)
            let folder = item.currentTarget.dataset.folder;
            if(folder) {
                 await song(`songs/${folder}/`);
            }
        })
    });   
}

async function play(){
    await song("songs/KumarSanu/");
    playmusic(songsname[1],true);
    await displayAlbums();

    // Attach an event listener
    playbtn.addEventListener("click",()=>{
        if(currentsong.paused){
            currentsong.play();
            playbtn.src="svg_images/pause.svg";
        }
        else{
            currentsong.pause();
            playbtn.src="svg_images/play.svg";
        }
    })

    // timeupdate
    currentsong.addEventListener("timeupdate", ()=>{
        document.querySelector(".songtime").innerHTML=`${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    })

    document.querySelector(".seekbar").addEventListener("click", (e)=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration*percent)/100
    })

    // Add event listener to toggle hamburger
    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0%";
    })

    document.querySelector(".cross").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-114%";
    })

    // Attach event listener on next button
    previousbtn.addEventListener("click", ()=>{
        let currentTrack = currentsong.src.split('/').pop(); // Get the last part of the path
        let index = songsname.indexOf(currentTrack);
        if(index>0){
            playmusic(songsname[index-1]);
        }
    })

    nextbtn.addEventListener("click", ()=>{
        let currentTrack = currentsong.src.split('/').pop(); // Get the last part of the path
        let index = songsname.indexOf(currentTrack);
        if(index<songsname.length-1){
            playmusic(songsname[index+1]);
        }
    })

    // Add event listener to adjust the volume
    document.querySelector(".range").addEventListener("change", (e)=>{
        console.log(e.target.value);
        currentsong.volume = e.target.value/100

        if(currentsong.volume>0){
            document.querySelector(".volume > img").src =  document.querySelector(".volume > img").src.replace("svg_images/mute.svg", "svg_images/volume.svg");
        }
        else if(currentsong.volume==0){
            document.querySelector(".volume > img").src =  document.querySelector(".volume > img").src.replace("svg_images/volume.svg","svg_images/mute.svg");
        }
    })

    // Add event listener to mute the volume
    let vol = document.querySelector(".volume > img")
    vol.addEventListener("click", e=>{
        if(e.target.src.includes("svg_images/volume.svg")){
            e.target.src = e.target.src.replace("svg_images/volume.svg","svg_images/mute.svg");
            currentsong.volume = 0;
            document.querySelector(".range").value = 0;
        }
        else{
            e.target.src = e.target.src.replace("svg_images/mute.svg", "svg_images/volume.svg");
            currentsong.volume = .20;
            document.querySelector(".range").value = 20;
        }
    })
} 
play();
