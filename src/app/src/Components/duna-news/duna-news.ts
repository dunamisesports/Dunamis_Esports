import { Component, HostListener, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


export interface StreamCarac {
    channel: string;
    lastVideoStreamID?: number;
}

@Component({
    selector: 'app-duna-news',
    templateUrl: './duna-news.html',
    styleUrl: './duna-news.css'
})
export class DunaNews {
    sanitizer = inject(DomSanitizer);
    getEmbedUrl(stream: StreamCarac): SafeResourceUrl {
        //const parent = "localhost";
        const parent = "dunamis-esports.netlify.app"
        const base = 'https://player.twitch.tv/';

        const params = stream.lastVideoStreamID
            ? `?video=v${stream.lastVideoStreamID}&parent=${parent}`
            : `?channel=${stream.channel}&parent=${parent}`;
        console.log(base + params)
        return this.sanitizer.bypassSecurityTrustResourceUrl(base + params);
    }

    featuredStreams: StreamCarac[] = [
        { channel: 'Kairos_Solg', lastVideoStreamID: 2774900023 },
        { channel: 'Jobby00', lastVideoStreamID: 2775721812 },
        { channel: 'Dunamis_tv' }
    ];

    selectedImage: string | null = null;
    @HostListener('document:keydown.escape')
    onEscape(): void {
        this.closeImage();
    }

    openImage(image: string): void {
        console.log('IN openImage' + image)
        this.selectedImage = image;
    }

    closeImage(): void {
        this.selectedImage = null;
    }

}
