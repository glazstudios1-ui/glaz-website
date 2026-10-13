// =========================================================
// Glaz Studios — what the home page shows.
// Change this file only: photos, clips, films and links all live here.
// Photos go in the "media" folder on GitHub (about 1600 px, under 400 KB each).
//
// ⚠️ The photos in media/temp are TEMPORARY stand-ins for the design.
//    Replace every one of them with your own work before launch.
// =========================================================

// The opening reel: short WIDE clips, 4–6 seconds each, no sound, under ~4 MB each.
// Each item: video (the clip) + photo (shown while the clip loads, and on phones in low-power mode).
// Until you have clips, leave video: '' and the photo plays with a slow zoom.
export const REEL = [
  { video: '', photo: 'media/temp/17.jpg' },
  { video: '', photo: 'media/temp/15.jpg' },
  { video: '', photo: 'media/temp/06.jpg' },
  { video: '', photo: 'media/temp/13.jpg' },
  { video: '', photo: 'media/temp/19.jpg' },
];

// The five services: name + one photo each (the photo is cropped tall).
export const SERVICES = [
  { name: 'Photography', photo: 'media/temp/18.jpg' },
  { name: 'Cinematography', photo: 'media/temp/14.jpg' },
  { name: 'Full Coverage', photo: 'media/temp/08.jpg' },
  { name: 'Media Coverage', photo: 'media/temp/10.jpg' },
  { name: 'Photo Booth', photo: 'media/temp/07.jpg' },
];

// The photo wall under "Our work". Any number of photos, any shape.
export const GALLERY = [
  'media/temp/04.jpg', 'media/temp/11.jpg', 'media/temp/15.jpg', 'media/temp/03.jpg',
  'media/temp/09.jpg', 'media/temp/06.jpg', 'media/temp/16.jpg', 'media/temp/18.jpg',
  'media/temp/13.jpg', 'media/temp/02.jpg', 'media/temp/08.jpg', 'media/temp/17.jpg',
  'media/temp/05.jpg', 'media/temp/12.jpg', 'media/temp/19.jpg', 'media/temp/10.jpg',
];

// Films: upload to YouTube (can be "Unlisted") and paste the video ID
// (youtube.com/watch?v=AbC123xyz → 'AbC123xyz'). The first film is shown big.
export const FILMS = [
  { title: 'Highlight film', youtube: '', poster: 'media/temp/15.jpg' },
  { title: 'Highlight film', youtube: '', poster: 'media/temp/13.jpg' },
  { title: 'Highlight film', youtube: '', poster: 'media/temp/05.jpg' },
];

// The photo behind "Check your date" at the end of the page
export const CLOSING_PHOTO = 'media/temp/16.jpg';

// Links at the bottom. Leave '' to hide.
export const LINKS = {
  instagram: '',   // e.g. 'https://instagram.com/glazstudios'
  email: 'info@glazstudios.com',
};
