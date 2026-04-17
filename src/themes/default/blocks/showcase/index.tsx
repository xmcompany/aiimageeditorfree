'use client'

import { TextToVideoShowcase } from './text-to-video-showcase'
import { ImageToVideoShowcase } from './image-to-video-showcase'
import { ShowcaseHeader } from './showcase-header'

export function Showcase({ section }: { section: any }) {
  if (section.disabled) {
    return null
  }

  // Transform textToVideo items to video carousel format
  const textToVideoSlides =
    section.textToVideo?.items?.map((item: any) => ({
      prompt: item.prompt || '',
      src: item.videoSrc || '',
      url: item.url,
      target: item.target,
    })) || []

  // Transform imageToVideo items to image-to-video format
  const imageToVideoSlides =
    section.imageToVideo?.items?.map((item: any) => ({
      prompt: item.prompt || '',
      originalImage:
        typeof item.originalImage === 'string'
          ? item.originalImage
          : item.originalImage?.src || '',
      videoSrc: item.videoSrc || '',
      url: item.url,
      target: item.target,
    })) || []

  const Divider = () => (
    <div className="w-full h-px my-10 bg-[linear-gradient(90deg,rgba(99,102,241,0.00)_0%,#6366f1_50%,rgba(99,102,241,0.00)_100%)]"></div>
  )

  return (
    <section id={section.id} className="pt-16 pb-16 space-y-16 bg-background text-foreground">
      <div className="container">
        {/* Showcase Header */}
        <ShowcaseHeader
          title={section.title || "What is AI Video Generator Free"}
          description={section.description || "AI Video Generator Free is the ultimate AI visual creation platform that transforms text prompts and images into stunning, professional-quality videos and images. <br />Perfect for content creators, marketers, and storytellers."}
        />

        <Divider />

        {/* Text to Video Section */}
        {section.textToVideo && (
          <div>
            <div className="mx-auto mb-12 text-center">
              <h3 className="mb-6 text-pretty text-2xl font-bold lg:text-3xl">
                {section.textToVideo.title}
              </h3>
              <div
                className="mb-4 max-w-xl text-muted-foreground lg:max-w-none lg:text-lg"
                dangerouslySetInnerHTML={{
                  __html: section.textToVideo.description || '',
                }}
              />
            </div>
            <div className="relative overflow-hidden w-full h-full">
              <TextToVideoShowcase section={section} slides={textToVideoSlides} />
            </div>
          </div>
        )}

        <Divider />

        {/* Image to Video Section */}
        {section.imageToVideo && (
          <div>
            <div className="mx-auto mb-12 text-center">
              <h3 className="mb-6 text-pretty text-2xl font-bold lg:text-3xl">
                {section.imageToVideo.title}
              </h3>
              <div
                className="mb-4 max-w-xl text-muted-foreground lg:max-w-none lg:text-lg"
                dangerouslySetInnerHTML={{
                  __html: section.imageToVideo.description || '',
                }}
              />
            </div>
            <div className="relative overflow-hidden w-full h-full">
              <ImageToVideoShowcase
                section={section}
                slides={imageToVideoSlides}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
