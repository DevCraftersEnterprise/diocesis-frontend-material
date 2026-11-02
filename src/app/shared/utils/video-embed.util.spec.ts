import { toEmbedUrl } from './video-embed.util';

describe('toEmbedUrl', () => {
  it('reconoce youtube.com/watch?v=', () => {
    expect(toEmbedUrl('https://www.youtube.com/watch?v=abc123')).toBe(
      'https://www.youtube.com/embed/abc123',
    );
  });

  it('reconoce youtu.be/ (enlace corto)', () => {
    expect(toEmbedUrl('https://youtu.be/abc123')).toBe('https://www.youtube.com/embed/abc123');
  });

  it('reconoce youtube.com/shorts/', () => {
    expect(toEmbedUrl('https://www.youtube.com/shorts/abc123')).toBe(
      'https://www.youtube.com/embed/abc123',
    );
  });

  it('reconoce vimeo.com/<id>', () => {
    expect(toEmbedUrl('https://vimeo.com/123456789')).toBe(
      'https://player.vimeo.com/video/123456789',
    );
  });

  it('devuelve null para Facebook/Spotify/sitios no reconocidos', () => {
    expect(toEmbedUrl('https://facebook.com/diocesis/videos/1')).toBeNull();
    expect(toEmbedUrl('https://open.spotify.com/episode/1')).toBeNull();
    expect(toEmbedUrl('https://ejemplo.com')).toBeNull();
  });

  it('devuelve null si la URL es invalida en vez de lanzar', () => {
    expect(toEmbedUrl('no-es-una-url')).toBeNull();
  });

  it('devuelve null para youtube.com sin parametro v ni /shorts/', () => {
    expect(toEmbedUrl('https://www.youtube.com/')).toBeNull();
  });
});
