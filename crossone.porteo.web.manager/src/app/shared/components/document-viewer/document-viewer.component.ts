import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface DocumentViewerData { blob?: Blob; url?: string; fileName?: string; contentType?: string; }

/** Visionneuse de documents : aperçu image (zoom/pan) ou PDF (intégré), avec repli téléchargement. */
@Component({
  selector: 'app-document-viewer',
  standalone: false,
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.scss'],
})
export class DocumentViewerComponent implements OnInit, OnDestroy {
  fileName = 'document';
  isImage = false;
  isPdf = false;
  zoom = 1;
  rawUrl?: string;
  safeUrl?: SafeResourceUrl;
  private revoke = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DocumentViewerData,
    private ref: MatDialogRef<DocumentViewerComponent>,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.fileName = this.data.fileName || 'document';
    const ct = (this.data.contentType || this.data.blob?.type || '').toLowerCase();
    if (this.data.blob) { this.rawUrl = URL.createObjectURL(this.data.blob); this.revoke = true; }
    else this.rawUrl = this.data.url;

    this.isImage = ct.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(this.fileName);
    this.isPdf = ct.includes('pdf') || /\.pdf$/i.test(this.fileName);
    if (this.isPdf && this.rawUrl) this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawUrl);
  }

  ngOnDestroy(): void { if (this.revoke && this.rawUrl) URL.revokeObjectURL(this.rawUrl); }

  zoomIn(): void { this.zoom = Math.min(4, Math.round((this.zoom + 0.25) * 100) / 100); }
  zoomOut(): void { this.zoom = Math.max(0.4, Math.round((this.zoom - 0.25) * 100) / 100); }
  resetZoom(): void { this.zoom = 1; }
  get zoomPct(): number { return Math.round(this.zoom * 100); }

  download(): void {
    if (!this.rawUrl) return;
    const a = document.createElement('a');
    a.href = this.rawUrl; a.download = this.fileName; a.click();
  }
  close(): void { this.ref.close(); }
}
