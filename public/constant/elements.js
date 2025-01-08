
const NAME_SINGER = document.querySelector('#name-singer');
const IMAGE_FILE = document.querySelector('#image-file');
const MUSIC_FILE = document.querySelector('#music-file');
const PLAYING_HEADER = document.querySelector('.playing-header');


export const ADD_BTN = document.querySelector('#added-song');
export const ELEMENTS = {
     LI_ELEMENTS: null,
     PLAYING_ELEMENT_HEADER: PLAYING_HEADER,
};
export const SONG_OBJECT = {
    singer: NAME_SINGER,
    image: IMAGE_FILE,
    music: MUSIC_FILE,
}

setTimeout(function() {
    ELEMENTS.LI_ELEMENTS =  document.querySelectorAll('.menu-song');
}, 0)







