'use client'

import { Paperclip } from 'lucide-react'
import { useState, useRef, useCallback, useEffect } from 'react'
import { Textarea } from '@/shared/components/ui/textarea'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/ui/button'
import { useTranslations } from 'next-intl'
import { useAppContext } from '@/shared/contexts/app'
import { useRouter } from '@/core/i18n/navigation'
import ModelSelect from './model-select'
import { getModelDefaults } from '@/config/model-config'
import ParametersSelect from './parameters-select'
import ImageThumbnail from './image-thumbnail'
import { useSession } from '@/core/auth/client'

interface UseAutoResizeTextareaProps {
  minHeight: number
  maxHeight?: number
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current
      if (!textarea) return

      if (reset) {
        textarea.style.height = `${minHeight}px`
        return
      }

      textarea.style.height = `${minHeight}px`

      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      )

      textarea.style.height = `${newHeight}px`
    },
    [minHeight, maxHeight]
  )

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = `${minHeight}px`
    }
  }, [minHeight])

  useEffect(() => {
    const handleResize = () => adjustHeight()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [adjustHeight])

  return { textareaRef, adjustHeight }
}

export default function HeroInput() {
  const { user, setIsShowSignModal } = useAppContext()
  const { data: session } = useSession()
  const router = useRouter()

  const t = useTranslations('video.hero_input')
  const [value, setValue] = useState('')
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 72,
    maxHeight: 300,
  })

  const [selectedModel, setSelectedModel] = useState('veo_3_1_lite')
  const [parameters, setParameters] = useState<Record<string, any>>(() =>
    getModelDefaults('veo_3_1_lite')
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId)
    setParameters(getModelDefaults(modelId))
  }

  const handleParameterChange = (paramId: string, value: string) => {
    setParameters((prev) => ({
      ...prev,
      [paramId]: value,
    }))
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    setSelectedImage(file)
    const previewUrl = URL.createObjectURL(file)
    setImagePreviewUrl(previewUrl)
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl)
      setImagePreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl)
      }
    }
  }, [imagePreviewUrl])

  const handleGenerate = async () => {
    if (!value.trim() || isGenerating) return

    setIsGenerating(true)
    try {
      const formData = new FormData()
      formData.append('prompt', value.trim())
      formData.append('model', selectedModel)
      formData.append('parameters', JSON.stringify(parameters))
      if (selectedImage) {
        formData.append('startImage', selectedImage)
      }

      const response = await fetch('/api/video/save', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed')
      }

      if (result.success && result.data?.id) {
        setValue('')
        adjustHeight(true)
        handleRemoveImage()
        router.push(`/ai-video-generator?id=${result.data.id}&type=new`)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && value.trim() && !isGenerating) {
      e.preventDefault()
      handleGenerate()
    }
  }

  return (
    <div id="hero-input" className="w-full max-w-4xl mx-auto pt-16">
      <div className="backdrop-blur-xl bg-black/20 dark:bg-white/10 border border-white/20 dark:border-white/20 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col">
          <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
            <Textarea
              value={value}
              placeholder={t('placeholder')}
              className={cn(
                '!bg-transparent w-full rounded-xl rounded-b-none px-6 py-4 border-none text-white placeholder:text-white/60 resize-none focus-visible:ring-0 focus-visible:ring-offset-0',
                'min-h-[120px] text-base leading-relaxed'
              )}
              ref={textareaRef}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                setValue(e.target.value)
                adjustHeight()
              }}
            />
          </div>

          {selectedImage && imagePreviewUrl && (
            <div className="flex items-center gap-3 p-2 bg-background/5 border-t border-white/10">
              <ImageThumbnail
                previewUrl={imagePreviewUrl}
                onRemove={handleRemoveImage}
                size="small"
              />
            </div>
          )}

          <div className="min-h-16 bg-white/5 backdrop-blur-sm rounded-b-xl flex items-center border-t border-white/10">
            <div className="flex items-center justify-between w-full px-6 py-3">
              <div className="flex items-center gap-3 flex-wrap">
                <ModelSelect
                  selectedModel={selectedModel}
                  onModelChange={handleModelChange}
                  variant="transparent"
                />

                <div className="h-6 w-px bg-white/20" />

                <label
                  className={cn(
                    'rounded-full p-2.5 bg-white/5 cursor-pointer border border-white/20',
                    'hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-primary',
                    'text-white/60 hover:text-white transition-all duration-200'
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <Paperclip className="w-5 h-5 transition-colors" />
                </label>

                <ParametersSelect
                  selectedModel={selectedModel}
                  parameters={parameters}
                  onParameterChange={handleParameterChange}
                  variant="transparent"
                />
              </div>

              <div className="flex items-center gap-4">
                {session?.user || user ? (
                  <Button
                    disabled={!value.trim() || isGenerating}
                    onClick={handleGenerate}
                    className="rounded-full"
                  >
                    {isGenerating ? t('generating_button') : t('generate_button')}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setIsShowSignModal(true)}
                    className="rounded-full shadow-xs"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {(t.raw('quick_prompts') as string[]).map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => {
              setValue(prompt)
              setTimeout(() => adjustHeight(), 0)
            }}
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-sm transition-all duration-200 backdrop-blur-sm border border-white/20"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}
