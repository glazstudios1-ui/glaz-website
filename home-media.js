// =========================================================
// Glaz Studios — what the home page shows.
// Change this file only: photos, clips, films and links all live here.
// Photos go in the "media" folder on GitHub (about 1600 px, under 400 KB each).
//
// The photos in media/work were picked from the Social folder on john Ex 3.
// Make sure the couples are happy for their photos to be on the website.
// =========================================================

// The opening reel: short WIDE clips, 4–6 seconds each, no sound, under ~4 MB each.
// Each item: video (the clip) + photo (shown while the clip loads, and on phones in low-power mode).
// Until you have clips, leave video: '' and the photo plays with a slow zoom.
export const REEL = [
  { video: '', photo: 'media/work/reel-04.jpg' },
  { video: '', photo: 'media/work/reel-02.jpg' },
  { video: '', photo: 'media/work/reel-03.jpg' },
  { video: '', photo: 'media/work/reel-06.jpg' },
  { video: '', photo: 'media/work/reel-05.jpg' },
  { video: '', photo: 'media/work/reel-01.jpg' },
];

// The five services: name + one photo each (the photo is cropped tall).
export const SERVICES = [
  { name: 'Photography', photo: 'media/work/svc-01.jpg' },
  { name: 'Cinematography', photo: 'media/work/svc-02.jpg' },
  { name: 'Full Coverage', photo: 'media/work/svc-03.jpg' },
  { name: 'Media Coverage', photo: 'media/work/svc-04.jpg' },
  { name: 'Photo Booth', photo: 'media/work/svc-05.jpg' },
];

// The photo wall under "Our work". Any number of photos, any shape.
export const GALLERY = [
  'media/work/gal-01.jpg',
  'media/work/gal-02.jpg',
  'media/work/gal-03.jpg',
  'media/work/gal-04.jpg',
  'media/work/gal-05.jpg',
  'media/work/gal-06.jpg',
  'media/work/gal-07.jpg',
  'media/work/gal-08.jpg',
  'media/work/gal-09.jpg',
  'media/work/gal-10.jpg',
  'media/work/gal-11.jpg',
  'media/work/gal-12.jpg',
  'media/work/gal-13.jpg',
  'media/work/gal-14.jpg',
  'media/work/gal-15.jpg',
  'media/work/gal-16.jpg',
  'media/work/gal-17.jpg',
  'media/work/gal-18.jpg',
  'media/work/gal-19.jpg',
  'media/work/gal-20.jpg',
];

// Films: upload to YouTube (can be "Unlisted") and paste the video ID
// (youtube.com/watch?v=AbC123xyz → 'AbC123xyz'). The first film is shown big.
export const FILMS = [
  { title: 'Highlight film', youtube: '', poster: 'media/work/film-01.jpg' },
  { title: 'Highlight film', youtube: '', poster: 'media/work/film-02.jpg' },
  { title: 'Highlight film', youtube: '', poster: 'media/work/film-03.jpg' },
];

// The photo behind "Check your date" at the end of the page
export const CLOSING_PHOTO = 'media/work/close-01.jpg';

// Links at the bottom. Leave '' to hide.
export const LINKS = {
  instagram: '',   // e.g. 'https://instagram.com/glazstudios'
  email: 'info@glazstudios.com',
};
