import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';
import { LucideAngularModule } from 'lucide-angular';
import { MultimediaService } from '../../admin/multimedia/services/multimedia';
import { IconsService } from '../../core/services/icons.service';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { toEmbedUrl } from '../../shared/utils/video-embed.util';

/** `/multimedia/misas`. Si la URL es de YouTube/Vimeo se incrusta el reproductor; el
 * resto (Facebook, Spotify, sitios web) se muestra como tarjeta con enlace externo. */
@Component({
  selector: 'app-multimedia-public',
  imports: [CommonModule, LucideAngularModule, EmptyState],
  templateUrl: './multimedia.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultimediaPublic implements OnInit {
  private readonly title = inject(Title);
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly iconsService = inject(IconsService);
  protected readonly multimediaService = inject(MultimediaService);

  readonly loading = signal(true);

  ngOnInit(): void {
    this.title.setTitle('Multimedia - Diócesis de Ciudad Obregón');
    this.multimediaService.listPublic().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  embedUrl(url: string): SafeResourceUrl | null {
    const embed = toEmbedUrl(url);
    return embed ? this.sanitizer.bypassSecurityTrustResourceUrl(embed) : null;
  }
}
