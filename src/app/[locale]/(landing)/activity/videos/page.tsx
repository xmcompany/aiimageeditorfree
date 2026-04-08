import VideoGallery from '@/shared/components/video/video-gallery';

export default async function ActivityVideosPage() {
  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <VideoGallery />
      </div>
    </div>
  );
}
